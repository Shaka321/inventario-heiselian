import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import type { ICategoriaRepository } from '../repositories/categoria.repository.interface';
import { I_CATEGORIA_REPOSITORY } from '../repositories/categoria.repository.interface';
import { UpdateCategoriaDto } from '../dtos';

@Injectable()
export class UpdateCategoriaUseCase {
  constructor(
    @Inject(I_CATEGORIA_REPOSITORY)
    private readonly categoriaRepo: ICategoriaRepository,
  ) {}

  async execute(id: string, dto: UpdateCategoriaDto): Promise<void> {
    const categoria = await this.categoriaRepo.findById(id);
    if (!categoria) {
      throw new NotFoundException('Categoria no encontrada');
    }

    if (dto.nombre) {
      const existente = await this.categoriaRepo.findByNombre(dto.nombre);
      if (existente && existente.id !== id) {
        throw new ConflictException('Ya existe una categoria con ese nombre');
      }
    }

    await this.categoriaRepo.update(id, dto);
  }
}
