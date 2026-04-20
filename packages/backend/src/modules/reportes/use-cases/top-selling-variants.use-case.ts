import { Injectable, Inject } from '@nestjs/common';
import { I_REPORTES_REPOSITORY } from '../repositories/reportes.repository.interface';
import type { IReportesRepository, TopSellingVariant } from '../repositories/reportes.repository.interface';
import { RedisCacheService } from '../../../shared/cache/redis-cache.service';
import { TopSellingDto } from '../dtos';

const TTL_SECONDS = 300; // 5 minutos
const NAMESPACE = 'reporte:top-variantes';

@Injectable()
export class TopSellingVariantsUseCase {
  constructor(
    @Inject(I_REPORTES_REPOSITORY)
    private readonly reportesRepo: IReportesRepository,
    private readonly cache: RedisCacheService,
  ) {}

  async execute(dto: TopSellingDto): Promise<TopSellingVariant[]> {
    const suffix = `${dto.desde}:${dto.hasta}:${dto.limit ?? 10}`;
    const cacheKey = await this.cache.buildVersionedKey(NAMESPACE, suffix);

    const cached = await this.cache.get<TopSellingVariant[]>(cacheKey);
    if (cached) return cached;

    const result = await this.reportesRepo.topSellingVariants({
      desde: new Date(dto.desde),
      hasta: new Date(dto.hasta),
      limit: dto.limit ?? 10,
    });

    await this.cache.set(cacheKey, result, TTL_SECONDS);
    return result;
  }
}



