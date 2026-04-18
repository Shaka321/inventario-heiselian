import { Inject, Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import type { IVarianteRepository } from '../repositories/variante.repository.interface';
import { I_VARIANTE_REPOSITORY } from '../repositories/variante.repository.interface';
import type { IProductoRepository } from '../../productos/repositories/producto.repository.interface';
import { I_PRODUCTO_REPOSITORY } from '../../productos/repositories/producto.repository.interface';
import { CreateVarianteDto } from '../dtos';
import * as crypto from 'crypto';

@Injectable()
export class CreateVarianteUseCase {
  constructor(
    @Inject(I_VARIANTE_REPOSITORY)
    private readonly varianteRepo: IVarianteRepository,
    @Inject(I_PRODUCTO_REPOSITORY)
    private readonly productoRepo: IProductoRepository,
  ) {}

  async execute(dto: CreateVarianteDto): Promise<{ id: string }> {
    const producto = await this.productoRepo.findById(dto.productoId);
    if (!producto || !producto.activo) {
      throw new NotFoundException('Producto no encontrado o inactivo');
    }

    const existente = await this.varianteRepo.findBySku(dto.sku);
    if (existente) {
      throw new ConflictException('Ya existe una variante con ese SKU');
    }

    const variante = {
      id: crypto.randomUUID(),
      productoId: dto.productoId,
      sku: dto.sku.trim().toUpperCase(),
      precio: dto.precio,
      costo: dto.costo,
      stock: dto.stock,
      activo: true,
      creadoEn: new Date(),
    };

    await this.varianteRepo.save(variante);
    return { id: variante.id };
  }
}
