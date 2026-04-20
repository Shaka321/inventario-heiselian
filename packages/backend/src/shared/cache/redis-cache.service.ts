import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisCacheService.name);

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379'),
      password: process.env.REDIS_PASSWORD ?? undefined,
      lazyConnect: true,
    });

    this.client.on('error', (err) => {
      this.logger.warn(`Redis connection error: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  // -- Cache Versioning (NUEVO v3.0) -------------------------------------
  async getVersion(namespace: string): Promise<number> {
    const version = await this.client
      .get(`version:${namespace}`)
      .catch(() => null);
    return version ? parseInt(version) : 1;
  }

  async incrementVersion(namespace: string): Promise<number> {
    return this.client.incr(`version:${namespace}`).catch(() => 1);
  }

  async buildVersionedKey(namespace: string, suffix: string): Promise<string> {
    const version = await this.getVersion(namespace);
    return `${namespace}:${suffix}:v${version}`;
  }

  // -- Core Cache Operations ---------------------------------------------
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      this.logger.warn(`Cache set failed for key ${key}: ${err.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch {
      // silencioso � no cr�tico
    }
  }

  async invalidateNamespace(namespace: string): Promise<void> {
    await this.incrementVersion(namespace);
  }
}
