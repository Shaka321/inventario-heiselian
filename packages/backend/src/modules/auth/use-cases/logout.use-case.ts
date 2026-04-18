import { Inject, Injectable } from '@nestjs/common';
import type { IAuthRepository } from '../repositories/auth.repository.interface';
import { I_AUTH_REPOSITORY } from '../repositories/auth.repository.interface';
import * as crypto from 'crypto';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(I_AUTH_REPOSITORY)
    private readonly authRepo: IAuthRepository,
  ) {}

  async execute(refreshTokenValue: string): Promise<void> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshTokenValue)
      .digest('hex');
    await this.authRepo.revokeRefreshToken(tokenHash);
  }
}
