import { Injectable, Inject } from '@nestjs/common';
import { I_AJUSTE_REPOSITORY } from '../repositories/ajuste.repository.interface';
import type { IAjusteRepository, AjusteManual } from '../repositories/ajuste.repository.interface';
import { ListAdjustmentsDto } from '../dtos';

@Injectable()
export class ListAdjustmentsUseCase {
  constructor(
    @Inject(I_AJUSTE_REPOSITORY)
    private readonly ajusteRepo: IAjusteRepository,
  ) {}

  async execute(filtros: ListAdjustmentsDto): Promise<{
    data: AjusteManual[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 20;

    const { data, total } = await this.ajusteRepo.listarAjustes({
      varianteId: filtros.varianteId,
      usuarioId: filtros.usuarioId,
      desde: filtros.desde ? new Date(filtros.desde) : undefined,
      hasta: filtros.hasta ? new Date(filtros.hasta) : undefined,
      page,
      limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}



