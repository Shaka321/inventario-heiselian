import { Inject, Injectable } from '@nestjs/common';
import type { ICategoriaRepository } from '../repositories/categoria.repository.interface';
import { I_CATEGORIA_REPOSITORY } from '../repositories/categoria.repository.interface';

@Injectable()
export class ListCategoriasUseCase {
  constructor(
    @Inject(I_CATEGORIA_REPOSITORY)
    private readonly categoriaRepo: ICategoriaRepository,
  ) {}

  async execute(soloActivas = true) {
    return this.categoriaRepo.findAll(soloActivas);
  }
}
