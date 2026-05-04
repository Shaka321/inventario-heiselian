import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../../../shared/cache/redis-cache.service';

const MAX_ATTEMPTS = parseInt(process.env['LOCKOUT_MAX_ATTEMPTS'] ?? '5');
const LOCKOUT_SECONDS = parseInt(process.env['LOCKOUT_DURATION_MINUTES'] ?? '15') * 60;
const ATTEMPTS_TTL = 60 * 60; // 1 hora para resetear intentos

@Injectable()
export class AccountLockoutService {
  constructor(private readonly redis: RedisCacheService) {}

  private attemptsKey(email: string): string {
    return `login_attempts:${email}`;
  }

  private lockedKey(email: string): string {
    return `login_locked:${email}`;
  }

  async isLocked(email: string): Promise<boolean> {
    const locked = await this.redis.get<{ lockedAt: number }>(this.lockedKey(email));
    return locked !== null;
  }

  async recordFailedAttempt(email: string): Promise<{ locked: boolean; attempts: number }> {
    const key = this.attemptsKey(email);
    const current = await this.redis.get<{ count: number }>(key);
    const attempts = (current?.count ?? 0) + 1;

    await this.redis.set(key, { count: attempts }, ATTEMPTS_TTL);

    if (attempts >= MAX_ATTEMPTS) {
      await this.redis.set(
        this.lockedKey(email),
        { lockedAt: Date.now() },
        LOCKOUT_SECONDS,
      );
      await this.redis.del(key);
      return { locked: true, attempts };
    }

    return { locked: false, attempts };
  }

  async clearFailedAttempts(email: string): Promise<void> {
    await this.redis.del(this.attemptsKey(email));
  }

  async getRemainingAttempts(email: string): Promise<number> {
    const current = await this.redis.get<{ count: number }>(this.attemptsKey(email));
    return Math.max(0, MAX_ATTEMPTS - (current?.count ?? 0));
  }
}