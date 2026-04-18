import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProductoRepository } from '../repositories/producto.repository.interface';
import { I_PRODUCTO_REPOSITORY } from '../repositories/producto.repository.interface';

@Injectable()
export class SoftDeleteProductoUseCase {
  constructor(
    @Inject(I_PRODUCTO_REPOSITORY)
    private readonly productoRepo: IProductoRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const producto = await this.productoRepo.findById(id);
    if (!producto || !producto.activo) {
      throw new NotFoundException('Producto no encontrado');
    }
    await this.productoRepo.softDelete(id);
  }
}
