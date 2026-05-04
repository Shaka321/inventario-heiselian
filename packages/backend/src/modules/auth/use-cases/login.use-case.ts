import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { I_AUTH_REPOSITORY } from '../repositories/auth.repository.interface';
import type { IAuthRepository } from '../repositories/auth.repository.interface';
import type { LoginDto, AuthTokensResponse, JwtPayload } from '../dtos';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { AccountLockoutService } from '../infrastructure/account-lockout.service';
import { createHash, randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(I_AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly lockout: AccountLockoutService,
  ) {}

  async execute(dto: LoginDto): Promise<{ tokens: AuthTokensResponse; rawRefreshToken: string }> {
    const email = dto.email.toLowerCase().trim();

    const isLocked = await this.lockout.isLocked(email);
    if (isLocked) {
      throw new UnauthorizedException(
        'Cuenta bloqueada temporalmente. Intente en 15 minutos.',
      );
    }

    const usuario = await this.authRepository.findUsuarioByEmail(email);
    if (!usuario) {
      await this.lockout.recordFailedAttempt(email);
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const passwordValid = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordValid) {
      const result = await this.lockout.recordFailedAttempt(email);
      if (result.locked) {
        throw new UnauthorizedException(
          'Cuenta bloqueada por multiples intentos fallidos. Intente en 15 minutos.',
        );
      }
      throw new UnauthorizedException('Credenciales invalidas');
    }

    await this.lockout.clearFailedAttempts(email);

    const sessionId = randomUUID();

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email.valor,
      rol: usuario.rol.valor,
      sessionId,
    };

    const accessToken = this.jwtService.sign(payload);

    const rawRefreshToken = randomUUID();
    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');

    const refreshToken = RefreshToken.crear({
      id: randomUUID(),
      usuarioId: usuario.id,
      tokenHash,
    });

    await this.authRepository.saveRefreshToken(refreshToken);

    const tokens: AuthTokensResponse = {
      accessToken,
      expiresIn: 15 * 60,
    };

    return { tokens, rawRefreshToken };
  }
}