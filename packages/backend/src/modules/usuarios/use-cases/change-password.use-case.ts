import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { IUsuarioRepository } from '../repositories/usuario.repository.interface';
import { I_USUARIO_REPOSITORY } from '../repositories/usuario.repository.interface';
import { ChangePasswordDto } from '../dtos';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(I_USUARIO_REPOSITORY)
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  async execute(id: string, dto: ChangePasswordDto): Promise<void> {
    const usuario = await this.usuarioRepo.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const passwordValido = await bcrypt.compare(dto.passwordActual, usuario.passwordHash);
    if (!passwordValido) {
      throw new UnauthorizedException('Password actual incorrecto');
    }

    const nuevoHash = await bcrypt.hash(dto.passwordNuevo, 12);
    await this.usuarioRepo.updatePassword(id, nuevoHash);
  }
}
