import { Inject, Injectable } from '@nestjs/common';
import type { IUsuarioRepository } from '../repositories/usuario.repository.interface';
import { I_USUARIO_REPOSITORY } from '../repositories/usuario.repository.interface';

@Injectable()
export class ListUsuariosUseCase {
  constructor(
    @Inject(I_USUARIO_REPOSITORY)
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  async execute() {
    const usuarios = await this.usuarioRepo.findAll();
    return usuarios.map((u) => ({
      id: u.id,
      email: u.email.valor,
      rol: u.rol.valor,
      activo: u.activo,
      creadoEn: u.creadoEn,
    }));
  }
}
