import { AccountLockoutService } from '../infrastructure/account-lockout.service';
import { RedisCacheService } from '../../../shared/cache/redis-cache.service';

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('AccountLockoutService', () => {
  let service: AccountLockoutService;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env['LOCKOUT_MAX_ATTEMPTS'];
    delete process.env['LOCKOUT_DURATION_MINUTES'];
    service = new AccountLockoutService(mockRedis as unknown as RedisCacheService);
  });

  it('isLocked retorna false si no hay bloqueo', async () => {
    mockRedis.get.mockResolvedValue(null);
    const result = await service.isLocked('user@test.com');
    expect(result).toBe(false);
  });

  it('isLocked retorna true si la cuenta esta bloqueada', async () => {
    mockRedis.get.mockResolvedValue({ lockedAt: Date.now() });
    const result = await service.isLocked('user@test.com');
    expect(result).toBe(true);
  });

  it('recordFailedAttempt incrementa el contador', async () => {
    mockRedis.get.mockResolvedValue({ count: 2 });
    mockRedis.set.mockResolvedValue(undefined);
    const result = await service.recordFailedAttempt('user@test.com');
    expect(result.attempts).toBe(3);
    expect(result.locked).toBe(false);
  });

  it('bloquea la cuenta al llegar a 5 intentos', async () => {
    mockRedis.get.mockResolvedValue({ count: 4 });
    mockRedis.set.mockResolvedValue(undefined);
    mockRedis.del.mockResolvedValue(undefined);
    const result = await service.recordFailedAttempt('user@test.com');
    expect(result.locked).toBe(true);
    expect(mockRedis.set).toHaveBeenCalledWith(
      'login_locked:user@test.com',
      expect.objectContaining({ lockedAt: expect.any(Number) }),
      900,
    );
  });

  it('clearFailedAttempts elimina el contador', async () => {
    mockRedis.del.mockResolvedValue(undefined);
    await service.clearFailedAttempts('user@test.com');
    expect(mockRedis.del).toHaveBeenCalledWith('login_attempts:user@test.com');
  });

  it('getRemainingAttempts retorna intentos restantes', async () => {
    mockRedis.get.mockResolvedValue({ count: 3 });
    const remaining = await service.getRemainingAttempts('user@test.com');
    expect(remaining).toBe(2);
  });

  it('primer intento fallido parte desde 1', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue(undefined);
    const result = await service.recordFailedAttempt('user@test.com');
    expect(result.attempts).toBe(1);
    expect(result.locked).toBe(false);
  });
});