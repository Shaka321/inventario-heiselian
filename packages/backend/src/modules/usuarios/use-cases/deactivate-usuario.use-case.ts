import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { IUsuarioRepository } from '../repositories/usuario.repository.interface';
import { I_USUARIO_REPOSITORY } from '../repositories/usuario.repository.interface';

@Injectable()
export class DeactivateUsuarioUseCase {
  constructor(
    @Inject(I_USUARIO_REPOSITORY)
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  async execute(id: string, solicitanteId: string): Promise<void> {
    if (id === solicitanteId) {
      throw new BadRequestException('No puedes desactivar tu propia cuenta');
    }

    const usuario = await this.usuarioRepo.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!usuario.activo) {
      throw new BadRequestException('El usuario ya esta desactivado');
    }

    await this.usuarioRepo.update(id, { activo: false });
  }
}
