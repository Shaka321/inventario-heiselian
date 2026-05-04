import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../../../shared/cache/redis-cache.service';

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 dias

@Injectable()
export class RedisAuthService {
  constructor(private readonly redis: RedisCacheService) {}

  async saveRefreshToken(tokenHash: string, usuarioId: string): Promise<void> {
    await this.redis.set(
      `refresh:${tokenHash}`,
      { usuarioId },
      REFRESH_TTL_SECONDS,
    );
  }

  async findRefreshToken(tokenHash: string): Promise<{ usuarioId: string } | null> {
    return this.redis.get<{ usuarioId: string }>(`refresh:${tokenHash}`);
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.redis.del(`refresh:${tokenHash}`);
  }

  async revokeAllUserTokens(usuarioId: string): Promise<void> {
    await this.redis.set(
      `revoked_user:${usuarioId}`,
      { revokedAt: Date.now() },
      REFRESH_TTL_SECONDS,
    );
  }
}