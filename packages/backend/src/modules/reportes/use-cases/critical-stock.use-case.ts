import { Injectable, Inject } from '@nestjs/common';
import { I_REPORTES_REPOSITORY } from '../repositories/reportes.repository.interface';
import type { IReportesRepository, CriticalStockItem } from '../repositories/reportes.repository.interface';
import { RedisCacheService } from '../../../shared/cache/redis-cache.service';
import { CriticalStockDto } from '../dtos';

const TTL_SECONDS = 120; // 2 minutos � m�s agresivo por criticidad
const NAMESPACE = 'reporte:stock-critico';

@Injectable()
export class CriticalStockUseCase {
  constructor(
    @Inject(I_REPORTES_REPOSITORY)
    private readonly reportesRepo: IReportesRepository,
    private readonly cache: RedisCacheService,
  ) {}

  async execute(dto: CriticalStockDto): Promise<CriticalStockItem[]> {
    const umbral = dto.umbralMinimo ?? 5;
    const cacheKey = await this.cache.buildVersionedKey(
      NAMESPACE,
      `umbral:${umbral}`,
    );

    const cached = await this.cache.get<CriticalStockItem[]>(cacheKey);
    if (cached) return cached;

    const result = await this.reportesRepo.criticalStock(umbral);

    await this.cache.set(cacheKey, result, TTL_SECONDS);
    return result;
  }
}



