import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IUsuarioRepository } from '../repositories/usuario.repository.interface';
import { I_USUARIO_REPOSITORY } from '../repositories/usuario.repository.interface';
import { UpdateUsuarioDto } from '../dtos';

@Injectable()
export class UpdateUsuarioUseCase {
  constructor(
    @Inject(I_USUARIO_REPOSITORY)
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  async execute(id: string, dto: UpdateUsuarioDto): Promise<void> {
    const usuario = await this.usuarioRepo.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    await this.usuarioRepo.update(id, { rol: dto.rol });
  }
}
