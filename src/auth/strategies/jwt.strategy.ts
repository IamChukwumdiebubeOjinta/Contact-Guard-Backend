import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  username: string;
}

interface ValidatedUser {
  userId: string;
  username: string;
}

/**
 * Injectable class representing a JWT authentication strategy.
 * Extends PassportStrategy and initializes with JWT extraction method, expiration check, and secret key.
 * Validates the payload by extracting user ID and username.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<ValidatedUser> {
    return { userId: payload.sub, username: payload.username };
  }
}
