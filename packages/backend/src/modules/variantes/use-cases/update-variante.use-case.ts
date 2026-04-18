import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import type { IVarianteRepository } from '../repositories/variante.repository.interface';
import { I_VARIANTE_REPOSITORY } from '../repositories/variante.repository.interface';
import { UpdateVarianteDto } from '../dtos';

@Injectable()
export class UpdateVarianteUseCase {
  constructor(
    @Inject(I_VARIANTE_REPOSITORY)
    private readonly varianteRepo: IVarianteRepository,
  ) {}

  async execute(id: string, dto: UpdateVarianteDto): Promise<void> {
    const variante = await this.varianteRepo.findById(id);
    if (!variante || !variante.activo) {
      throw new NotFoundException('Variante no encontrada');
    }

    if (dto.sku) {
      const existente = await this.varianteRepo.findBySku(dto.sku);
      if (existente && existente.id !== id) {
        throw new ConflictException('Ya existe una variante con ese SKU');
      }
    }

    await this.varianteRepo.update(id, dto);
  }
}
