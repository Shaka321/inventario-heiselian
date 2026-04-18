import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IPrecioRepository } from '../repositories/precio.repository.interface';
import { I_PRECIO_REPOSITORY } from '../repositories/precio.repository.interface';
import type { IVarianteRepository } from '../../variantes/repositories/variante.repository.interface';
import { I_VARIANTE_REPOSITORY } from '../../variantes/repositories/variante.repository.interface';

@Injectable()
export class GetPriceHistoryUseCase {
  constructor(
    @Inject(I_PRECIO_REPOSITORY)
    private readonly precioRepo: IPrecioRepository,
    @Inject(I_VARIANTE_REPOSITORY)
    private readonly varianteRepo: IVarianteRepository,
  ) {}

  async execute(varianteId: string) {
    const variante = await this.varianteRepo.findById(varianteId);
    if (!variante) {
      throw new NotFoundException('Variante no encontrada');
    }
    return this.precioRepo.getPriceHistory(varianteId);
  }
}
