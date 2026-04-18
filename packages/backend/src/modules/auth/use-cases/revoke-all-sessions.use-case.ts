import { Inject, Injectable } from '@nestjs/common';
import type { IAuthRepository } from '../repositories/auth.repository.interface';
import { I_AUTH_REPOSITORY } from '../repositories/auth.repository.interface';

@Injectable()
export class RevokeAllSessionsUseCase {
  constructor(
    @Inject(I_AUTH_REPOSITORY)
    private readonly authRepo: IAuthRepository,
  ) {}

  async execute(usuarioId: string): Promise<void> {
    await this.authRepo.revokeAllUserTokens(usuarioId);
  }
}
