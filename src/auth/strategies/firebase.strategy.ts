import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import * as admin from 'firebase-admin';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase-jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(token: string) {
    // If Firebase is disabled, use a mock token for development
    if (process.env.FIREBASE_DISABLED === 'true') {
      console.warn('Firebase is disabled. Using mock authentication.');

      // Find or create a test user
      let user = await this.prisma.user.findFirst();

      if (!user) {
        // Create a test user if none exists
        user = await this.prisma.user.create({
          data: {
            email: 'test@example.com',
            firebaseUid: 'mock-uid-123',
            firstName: 'Test',
            lastName: 'User',
            profile: {
              create: {}, // Create empty profile
            },
          },
        });
      }

      return user;
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Find user in our database
      const user = await this.prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
      });

      if (!user) {
        throw new UnauthorizedException('User not found in database');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
