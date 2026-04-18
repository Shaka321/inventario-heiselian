import { Inject, Injectable } from '@nestjs/common';
import type { IVarianteRepository } from '../../variantes/repositories/variante.repository.interface';
import { I_VARIANTE_REPOSITORY } from '../../variantes/repositories/variante.repository.interface';

export interface StockReportItem {
  varianteId: string;
  sku: string;
  stock: number;
  precio: number;
  costo: number;
  valorInventario: number;
}

@Injectable()
export class GetStockReportUseCase {
  constructor(
    @Inject(I_VARIANTE_REPOSITORY)
    private readonly varianteRepo: IVarianteRepository,
  ) {}

  async execute(): Promise<StockReportItem[]> {
    const variantes = await this.varianteRepo.findAll(true);
    return variantes.map((v) => ({
      varianteId: v.id,
      sku: v.sku,
      stock: v.stock,
      precio: v.precio,
      costo: v.costo,
      valorInventario: v.stock * v.costo,
    }));
  }
}
