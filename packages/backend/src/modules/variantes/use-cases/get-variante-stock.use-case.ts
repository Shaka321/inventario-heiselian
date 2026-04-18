import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IVarianteRepository } from '../repositories/variante.repository.interface';
import { I_VARIANTE_REPOSITORY } from '../repositories/variante.repository.interface';

@Injectable()
export class GetVarianteStockUseCase {
  constructor(
    @Inject(I_VARIANTE_REPOSITORY)
    private readonly varianteRepo: IVarianteRepository,
  ) {}

  async execute(
    id: string,
  ): Promise<{ id: string; sku: string; stock: number }> {
    const variante = await this.varianteRepo.findById(id);
    if (!variante || !variante.activo) {
      throw new NotFoundException('Variante no encontrada');
    }
    return {
      id: variante.id,
      sku: variante.sku,
      stock: variante.stock,
    };
  }
}
