import { Injectable, Inject } from '@nestjs/common';
import { I_CIERRE_CAJA_REPOSITORY } from '../repositories/cierre-caja.repository.interface';
import type { ICierreCajaRepository, CierreCaja } from '../repositories/cierre-caja.repository.interface';
import { GetCashRegisterHistoryDto } from '../dtos';

@Injectable()
export class GetCashRegisterHistoryUseCase {
  constructor(
    @Inject(I_CIERRE_CAJA_REPOSITORY)
    private readonly cierreCajaRepo: ICierreCajaRepository,
  ) {}

  async execute(filtros: GetCashRegisterHistoryDto): Promise<{
    data: CierreCaja[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 20;

    const { data, total } = await this.cierreCajaRepo.listar({
      usuarioId: filtros.usuarioId,
      estado: filtros.estado,
      page,
      limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}



