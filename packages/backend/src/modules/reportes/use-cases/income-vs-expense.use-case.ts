import { Injectable, Inject } from '@nestjs/common';
import { I_REPORTES_REPOSITORY } from '../repositories/reportes.repository.interface';
import type { IReportesRepository, IncomeVsExpenseResult } from '../repositories/reportes.repository.interface';
import { RedisCacheService } from '../../../shared/cache/redis-cache.service';
import { PeriodFilterDto } from '../dtos';

const TTL_SECONDS = 300; // 5 minutos
const NAMESPACE = 'reporte:ingresos-egresos';

@Injectable()
export class IncomeVsExpenseUseCase {
  constructor(
    @Inject(I_REPORTES_REPOSITORY)
    private readonly reportesRepo: IReportesRepository,
    private readonly cache: RedisCacheService,
  ) {}

  async execute(dto: PeriodFilterDto): Promise<IncomeVsExpenseResult> {
    const suffix = `${dto.desde}:${dto.hasta}`;
    const cacheKey = await this.cache.buildVersionedKey(NAMESPACE, suffix);

    const cached = await this.cache.get<IncomeVsExpenseResult>(cacheKey);
    if (cached) return cached;

    const result = await this.reportesRepo.incomeVsExpense({
      desde: new Date(dto.desde),
      hasta: new Date(dto.hasta),
    });

    await this.cache.set(cacheKey, result, TTL_SECONDS);
    return result;
  }
}



