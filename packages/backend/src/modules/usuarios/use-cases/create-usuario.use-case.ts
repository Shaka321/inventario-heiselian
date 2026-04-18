import { Inject, Injectable, ConflictException } from '@nestjs/common';
import type { IUsuarioRepository } from '../repositories/usuario.repository.interface';
import { I_USUARIO_REPOSITORY } from '../repositories/usuario.repository.interface';
import { CreateUsuarioDto } from '../dtos';
import { Usuario } from '../../../domain/entities/usuario.entity';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class CreateUsuarioUseCase {
  constructor(
    @Inject(I_USUARIO_REPOSITORY)
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  async execute(dto: CreateUsuarioDto): Promise<{ id: string }> {
    const existente = await this.usuarioRepo.findByEmail(dto.email);
    if (existente) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const usuario = Usuario.crear({
      id: crypto.randomUUID(),
      email: dto.email,
      rol: dto.rol,
      passwordHash,
    });

    await this.usuarioRepo.save(usuario, passwordHash);
    return { id: usuario.id };
  }
}
