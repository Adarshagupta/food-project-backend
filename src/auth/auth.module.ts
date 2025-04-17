import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseStrategy } from './strategies/firebase.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'firebase-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    UsersModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, FirebaseStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
