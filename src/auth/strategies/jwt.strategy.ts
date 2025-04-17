import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Extract token from request
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    // Check if token is blacklisted
    const isBlacklisted = await this.redisService.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Return payload if token is valid
    return { id: payload.sub, email: payload.email };
  }
}
