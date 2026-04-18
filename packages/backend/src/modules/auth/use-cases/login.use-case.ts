import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { IAuthRepository } from '../repositories/auth.repository.interface';
import { I_AUTH_REPOSITORY } from '../repositories/auth.repository.interface';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { LoginDto, AuthTokensResponse, JwtPayload } from '../dtos';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(I_AUTH_REPOSITORY)
    private readonly authRepo: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthTokensResponse> {
    const usuario = await this.authRepo.findUsuarioByEmail(dto.email);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const passwordValido = await bcrypt.compare(
      dto.password,
      usuario.passwordHash,
    );
    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email.valor,
      rol: usuario.rol.valor,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshTokenValue = crypto.randomBytes(64).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshTokenValue)
      .digest('hex');

    const refreshToken = RefreshToken.crear({
      id: crypto.randomUUID(),
      usuarioId: usuario.id,
      tokenHash,
    });

    await this.authRepo.saveRefreshToken(refreshToken);
    await this.authRepo.updateLastLogin();

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: 900,
    };
  }
}
