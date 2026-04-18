import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IAuthRepository } from '../repositories/auth.repository.interface';
import { I_AUTH_REPOSITORY } from '../repositories/auth.repository.interface';
import * as crypto from 'crypto';
import { AuthTokensResponse, JwtPayload } from '../dtos';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(I_AUTH_REPOSITORY)
    private readonly authRepo: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(refreshTokenValue: string): Promise<AuthTokensResponse> {
    const tokenHash = crypto.createHash('sha256').update(refreshTokenValue).digest('hex');
    const stored = await this.authRepo.findRefreshToken(tokenHash);

    if (!stored || stored.revocado || !stored.estaVigente) {
      throw new UnauthorizedException('Refresh token invalido o expirado');
    }

    const usuario = await this.authRepo.findUsuarioById(stored.usuarioId);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    await this.authRepo.revokeRefreshToken(tokenHash);

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email.valor,
      rol: usuario.rol.valor,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const newRefreshTokenValue = crypto.randomBytes(64).toString('hex');
    const newTokenHash = crypto.createHash('sha256').update(newRefreshTokenValue).digest('hex');

    const newRefreshToken = RefreshToken.crear({
      id: crypto.randomUUID(),
      usuarioId: usuario.id,
      tokenHash: newTokenHash,
    });

    await this.authRepo.saveRefreshToken(newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshTokenValue,
      expiresIn: 900,
    };
  }
}
