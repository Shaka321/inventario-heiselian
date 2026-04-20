import { Injectable, Inject } from '@nestjs/common';
import { I_REPORTES_REPOSITORY } from '../repositories/reportes.repository.interface';
import type { IReportesRepository, SalesByPeriodResult } from '../repositories/reportes.repository.interface';
import { RedisCacheService } from '../../../shared/cache/redis-cache.service';
import { SalesByPeriodDto } from '../dtos';

const TTL_SECONDS = 300; // 5 minutos
const NAMESPACE = 'reporte:ventas';

@Injectable()
export class SalesByPeriodUseCase {
  constructor(
    @Inject(I_REPORTES_REPOSITORY)
    private readonly reportesRepo: IReportesRepository,
    private readonly cache: RedisCacheService,
  ) {}

  async execute(dto: SalesByPeriodDto): Promise<SalesByPeriodResult[]> {
    const suffix = `${dto.desde}:${dto.hasta}:${dto.agruparPor ?? 'dia'}`;
    const cacheKey = await this.cache.buildVersionedKey(NAMESPACE, suffix);

    const cached = await this.cache.get<SalesByPeriodResult[]>(cacheKey);
    if (cached) return cached;

    const result = await this.reportesRepo.salesByPeriod({
      desde: new Date(dto.desde),
      hasta: new Date(dto.hasta),
      agruparPor: dto.agruparPor ?? 'dia',
    });

    await this.cache.set(cacheKey, result, TTL_SECONDS);
    return result;
  }
}



