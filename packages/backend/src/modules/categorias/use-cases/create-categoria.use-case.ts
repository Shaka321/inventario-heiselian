import { Inject, Injectable, ConflictException } from '@nestjs/common';
import type { ICategoriaRepository } from '../repositories/categoria.repository.interface';
import { I_CATEGORIA_REPOSITORY } from '../repositories/categoria.repository.interface';
import { CreateCategoriaDto } from '../dtos';
import * as crypto from 'crypto';

@Injectable()
export class CreateCategoriaUseCase {
  constructor(
    @Inject(I_CATEGORIA_REPOSITORY)
    private readonly categoriaRepo: ICategoriaRepository,
  ) {}

  async execute(dto: CreateCategoriaDto): Promise<{ id: string }> {
    const existente = await this.categoriaRepo.findByNombre(dto.nombre);
    if (existente) {
      throw new ConflictException('Ya existe una categoria con ese nombre');
    }

    const categoria = {
      id: crypto.randomUUID(),
      nombre: dto.nombre.trim(),
      activo: true,
      creadoEn: new Date(),
    };

    await this.categoriaRepo.save(categoria);
    return { id: categoria.id };
  }
}
