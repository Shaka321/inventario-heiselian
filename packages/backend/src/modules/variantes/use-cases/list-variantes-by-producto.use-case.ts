import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IVarianteRepository } from '../repositories/variante.repository.interface';
import { I_VARIANTE_REPOSITORY } from '../repositories/variante.repository.interface';
import type { IProductoRepository } from '../../productos/repositories/producto.repository.interface';
import { I_PRODUCTO_REPOSITORY } from '../../productos/repositories/producto.repository.interface';

@Injectable()
export class ListVariantesByProductoUseCase {
  constructor(
    @Inject(I_VARIANTE_REPOSITORY)
    private readonly varianteRepo: IVarianteRepository,
    @Inject(I_PRODUCTO_REPOSITORY)
    private readonly productoRepo: IProductoRepository,
  ) {}

  async execute(productoId: string) {
    const producto = await this.productoRepo.findById(productoId);
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return this.varianteRepo.findByProductoId(productoId);
  }
}
