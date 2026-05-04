import { RedisAuthService } from '../infrastructure/redis-auth.service';
import { RedisCacheService } from '../../../shared/cache/redis-cache.service';

const mockRedis = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
};

describe('RedisAuthService', () => {
  let service: RedisAuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RedisAuthService(mockRedis as unknown as RedisCacheService);
  });

  it('guarda refresh token con TTL de 7 dias', async () => {
    await service.saveRefreshToken('hash-abc', 'user-1');
    expect(mockRedis.set).toHaveBeenCalledWith(
      'refresh:hash-abc',
      { usuarioId: 'user-1' },
      604800,
    );
  });

  it('encuentra refresh token existente', async () => {
    mockRedis.get.mockResolvedValue({ usuarioId: 'user-1' });
    const result = await service.findRefreshToken('hash-abc');
    expect(result).toEqual({ usuarioId: 'user-1' });
    expect(mockRedis.get).toHaveBeenCalledWith('refresh:hash-abc');
  });

  it('retorna null si el token no existe', async () => {
    mockRedis.get.mockResolvedValue(null);
    const result = await service.findRefreshToken('hash-inexistente');
    expect(result).toBeNull();
  });

  it('revoca refresh token eliminandolo de Redis', async () => {
    await service.revokeRefreshToken('hash-abc');
    expect(mockRedis.del).toHaveBeenCalledWith('refresh:hash-abc');
  });

  it('revoca todos los tokens del usuario', async () => {
    await service.revokeAllUserTokens('user-1');
    expect(mockRedis.set).toHaveBeenCalledWith(
      'revoked_user:user-1',
      expect.objectContaining({ revokedAt: expect.any(Number) }),
      604800,
    );
  });
});