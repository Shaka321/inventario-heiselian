import { Inject, Injectable } from '@nestjs/common';
import type { IProductoRepository } from '../repositories/producto.repository.interface';
import { I_PRODUCTO_REPOSITORY } from '../repositories/producto.repository.interface';

@Injectable()
export class ListProductosUseCase {
  constructor(
    @Inject(I_PRODUCTO_REPOSITORY)
    private readonly productoRepo: IProductoRepository,
  ) {}

  async execute(soloActivos = true) {
    return this.productoRepo.findAll(soloActivos);
  }
}
