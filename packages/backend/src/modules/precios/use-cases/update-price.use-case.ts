import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IPrecioRepository } from '../repositories/precio.repository.interface';
import { I_PRECIO_REPOSITORY } from '../repositories/precio.repository.interface';
import type { IVarianteRepository } from '../../variantes/repositories/variante.repository.interface';
import { I_VARIANTE_REPOSITORY } from '../../variantes/repositories/variante.repository.interface';
import { UpdatePriceDto } from '../dtos';
import * as crypto from 'crypto';

@Injectable()
export class UpdatePriceUseCase {
  constructor(
    @Inject(I_PRECIO_REPOSITORY)
    private readonly precioRepo: IPrecioRepository,
    @Inject(I_VARIANTE_REPOSITORY)
    private readonly varianteRepo: IVarianteRepository,
  ) {}

  async execute(dto: UpdatePriceDto, usuarioId: string): Promise<void> {
    const variante = await this.varianteRepo.findById(dto.varianteId);
    if (!variante || !variante.activo) {
      throw new NotFoundException('Variante no encontrada o inactiva');
    }

    const precioAnterior = await this.precioRepo.getCurrentPrice(
      dto.varianteId,
    );

    await this.precioRepo.updatePrice(dto.varianteId, dto.nuevoPrecio);

    await this.precioRepo.saveHistorial({
      id: crypto.randomUUID(),
      varianteId: dto.varianteId,
      usuarioId,
      precioAnterior,
      precioNuevo: dto.nuevoPrecio,
      fecha: new Date(),
    });
  }
}
