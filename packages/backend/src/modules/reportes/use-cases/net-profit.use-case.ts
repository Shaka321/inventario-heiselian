import { Injectable, Inject } from '@nestjs/common';
import { I_REPORTES_REPOSITORY } from '../repositories/reportes.repository.interface';
import type { IReportesRepository, NetProfitResult } from '../repositories/reportes.repository.interface';
import { RedisCacheService } from '../../../shared/cache/redis-cache.service';
import { PeriodFilterDto } from '../dtos';

const TTL_SECONDS = 300; // 5 minutos
const NAMESPACE = 'reporte:utilidad';

@Injectable()
export class NetProfitUseCase {
  constructor(
    @Inject(I_REPORTES_REPOSITORY)
    private readonly reportesRepo: IReportesRepository,
    private readonly cache: RedisCacheService,
  ) {}

  async execute(dto: PeriodFilterDto): Promise<NetProfitResult> {
    const suffix = `${dto.desde}:${dto.hasta}`;
    const cacheKey = await this.cache.buildVersionedKey(NAMESPACE, suffix);

    const cached = await this.cache.get<NetProfitResult>(cacheKey);
    if (cached) return cached;

    const result = await this.reportesRepo.netProfit({
      desde: new Date(dto.desde),
      hasta: new Date(dto.hasta),
    });

    await this.cache.set(cacheKey, result, TTL_SECONDS);
    return result;
  }
}



