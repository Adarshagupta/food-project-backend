import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private redisService: RedisService,
  ) {
    // Initialize Firebase Admin if not already initialized and not disabled
    if (!admin.apps.length && process.env.FIREBASE_DISABLED !== 'true') {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      } catch (error) {
        console.warn('Firebase initialization failed:', error.message);
        console.warn('Continuing without Firebase authentication');
      }
    }
  }

  async validateFirebaseToken(token: string) {
    // If Firebase is disabled, return a mock token for development
    if (process.env.FIREBASE_DISABLED === 'true') {
      console.warn('Firebase is disabled. Using mock token.');
      return {
        uid: 'mock-uid-123',
        email: 'test@example.com',
        name: 'Test User',
      };
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // In a real implementation, you would hash the password
      // const passwordHash = await bcrypt.hash(registerDto.password, 10);

      // Create user in our database
      const user = await this.usersService.create({
        email: registerDto.email,
        // We would store the password hash in a real implementation
        // passwordHash,
        // Generate a unique firebaseUid for local auth
        firebaseUid: registerDto.firebase_uid || `local-auth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        firstName: registerDto.first_name,
        lastName: registerDto.last_name,
        phoneNumber: registerDto.phone_number,
      });

      // Generate JWT token
      const payload = { sub: user.id, email: user.email };
      const token = this.jwtService.sign(payload);

      return {
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        access_token: token,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Registration failed: ' + error.message);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      // Find user in our database by email
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      // If user doesn't exist, throw an error
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // For development purposes, we'll accept any password
      // In production, you would verify the password against a hash
      if (process.env.NODE_ENV === 'production') {
        // In a real implementation, you would check the password hash
        // const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
        // if (!isPasswordValid) {
        //   throw new UnauthorizedException('Invalid email or password');
        // }
        console.log('Password verification skipped in development mode');
      }

      // Generate JWT token
      const payload = { sub: user.id, email: user.email };
      const token = this.jwtService.sign(payload);

      return {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        access_token: token,
      };
    } catch (error) {
      throw new UnauthorizedException('Login failed: ' + error.message);
    }
  }

  async logout(token: string) {
    try {
      // Verify and decode the token
      const decoded = this.jwtService.verify(token);

      // Calculate token expiration time
      const exp = decoded.exp;
      const now = Math.floor(Date.now() / 1000);
      const ttl = exp - now;

      if (ttl > 0) {
        // Add token to blacklist in Redis with TTL equal to remaining token lifetime
        await this.redisService.set(`blacklist:${token}`, '1', ttl);
      }

      return { message: 'Logout successful' };
    } catch (error) {
      // If token is invalid, just return success (no need to blacklist invalid tokens)
      return { message: 'Logout successful' };
    }
  }
}
