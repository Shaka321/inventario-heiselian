import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IInventarioRepository } from '../repositories/inventario.repository.interface';
import { I_INVENTARIO_REPOSITORY } from '../repositories/inventario.repository.interface';
import type { IVarianteRepository } from '../../variantes/repositories/variante.repository.interface';
import { I_VARIANTE_REPOSITORY } from '../../variantes/repositories/variante.repository.interface';
import { AdjustStockDto } from '../dtos';

@Injectable()
export class AdjustStockUseCase {
  constructor(
    @Inject(I_INVENTARIO_REPOSITORY)
    private readonly inventarioRepo: IInventarioRepository,
    @Inject(I_VARIANTE_REPOSITORY)
    private readonly varianteRepo: IVarianteRepository,
  ) {}

  async execute(dto: AdjustStockDto): Promise<void> {
    const variante = await this.varianteRepo.findById(dto.varianteId);
    if (!variante || !variante.activo) {
      throw new NotFoundException('Variante no encontrada o inactiva');
    }

    await this.inventarioRepo.ajustarStock(dto.varianteId, dto.nuevoStock);
  }
}
