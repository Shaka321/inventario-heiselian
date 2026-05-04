import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { JwtPayload, AuthenticatedUser } from '../dtos';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const publicKeyPath = configService.get<string>('JWT_PUBLIC_KEY_PATH') ?? 'keys/public.pem';
    const publicKey = readFileSync(join(process.cwd(), publicKeyPath), 'utf8');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (!payload.sub || !payload.email || !payload.rol || !payload.sessionId) {
      throw new UnauthorizedException('Token invalido');
    }
    return {
      id: payload.sub,
      email: payload.email,
      rol: payload.rol,
      sessionId: payload.sessionId,
    };
  }
}