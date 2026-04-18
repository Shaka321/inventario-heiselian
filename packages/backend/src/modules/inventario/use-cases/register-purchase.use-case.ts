import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IInventarioRepository } from '../repositories/inventario.repository.interface';
import { I_INVENTARIO_REPOSITORY } from '../repositories/inventario.repository.interface';
import type { IVarianteRepository } from '../../variantes/repositories/variante.repository.interface';
import { I_VARIANTE_REPOSITORY } from '../../variantes/repositories/variante.repository.interface';
import { RegisterPurchaseDto } from '../dtos';
import * as crypto from 'crypto';

@Injectable()
export class RegisterPurchaseUseCase {
  constructor(
    @Inject(I_INVENTARIO_REPOSITORY)
    private readonly inventarioRepo: IInventarioRepository,
    @Inject(I_VARIANTE_REPOSITORY)
    private readonly varianteRepo: IVarianteRepository,
  ) {}

  async execute(dto: RegisterPurchaseDto): Promise<{ id: string }> {
    const variante = await this.varianteRepo.findById(dto.varianteId);
    if (!variante || !variante.activo) {
      throw new NotFoundException('Variante no encontrada o inactiva');
    }

    const compra = {
      id: crypto.randomUUID(),
      varianteId: dto.varianteId,
      proveedorId: dto.proveedorId,
      cantidadUnidades: dto.cantidadUnidades,
      costoUnitario: dto.costoUnitario,
      creadoEn: new Date(),
    };

    await this.inventarioRepo.registrarCompra(compra);
    await this.inventarioRepo.incrementarStock(
      dto.varianteId,
      dto.cantidadUnidades,
    );

    return { id: compra.id };
  }
}
