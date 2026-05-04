import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { I_AUTH_REPOSITORY } from '../repositories/auth.repository.interface';
import type { IAuthRepository } from '../repositories/auth.repository.interface';
import type { AuthTokensResponse, JwtPayload } from '../dtos';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { createHash, randomUUID } from 'crypto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(I_AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(rawRefreshToken: string): Promise<{ tokens: AuthTokensResponse; rawRefreshToken: string }> {
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');

    const storedToken = await this.authRepository.findRefreshToken(tokenHash);
    if (!storedToken || storedToken.revocado || storedToken.expiraEn < new Date()) {
      throw new UnauthorizedException('Refresh token invalido o expirado');
    }

    const usuario = await this.authRepository.findUsuarioById(storedToken.usuarioId);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    await this.authRepository.revokeRefreshToken(tokenHash);

    const sessionId = randomUUID();

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email.valor,
      rol: usuario.rol.valor,
      sessionId,
    };

    const accessToken = this.jwtService.sign(payload);

    const newRawRefreshToken = randomUUID();
    const newTokenHash = createHash('sha256').update(newRawRefreshToken).digest('hex');

    const newRefreshToken = RefreshToken.crear({
      id: randomUUID(),
      usuarioId: usuario.id,
      tokenHash: newTokenHash,
    });

    await this.authRepository.saveRefreshToken(newRefreshToken);

    const tokens: AuthTokensResponse = {
      accessToken,
      expiresIn: 15 * 60,
    };

    return { tokens, rawRefreshToken: newRawRefreshToken };
  }
}