import { LoginUseCase } from '../use-cases/login.use-case';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import { Usuario } from '../../../domain/entities/usuario.entity';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';

const mockRepo = {
  findUsuarioByEmail: jest.fn(),
  findUsuarioById: jest.fn(),
  saveRefreshToken: jest.fn(),
  findRefreshToken: jest.fn(),
  revokeRefreshToken: jest.fn(),
  revokeAllUserTokens: jest.fn(),
  updateLastLogin: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('access-token-mock'),
};

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUseCase(mockRepo as any, mockJwtService as any);
  });

  it('debe retornar tokens cuando las credenciales son validas', async () => {
    const hash = await bcrypt.hash('password123', 10);
    const usuario = Usuario.crear({
      id: 'uuid-1',
      email: 'test@test.com',
      rol: 'EMPLEADO',
      passwordHash: hash,
    });

    mockRepo.findUsuarioByEmail.mockResolvedValue(usuario);
    mockRepo.saveRefreshToken.mockResolvedValue(undefined);
    mockRepo.updateLastLogin.mockResolvedValue(undefined);

    const result = await useCase.execute({ email: 'test@test.com', password: 'password123' });

    expect(result.accessToken).toBe('access-token-mock');
    expect(result.refreshToken).toBeDefined();
    expect(result.expiresIn).toBe(900);
    expect(mockRepo.saveRefreshToken).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
    mockRepo.findUsuarioByEmail.mockResolvedValue(null);
    await expect(
      useCase.execute({ email: 'noexiste@test.com', password: 'password123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('debe lanzar UnauthorizedException si el password es incorrecto', async () => {
    const hash = await bcrypt.hash('password123', 10);
    const usuario = Usuario.crear({
      id: 'uuid-1',
      email: 'test@test.com',
      rol: 'EMPLEADO',
      passwordHash: hash,
    });
    mockRepo.findUsuarioByEmail.mockResolvedValue(usuario);

    await expect(
      useCase.execute({ email: 'test@test.com', password: 'wrong-password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('debe lanzar UnauthorizedException si el usuario esta inactivo', async () => {
    const hash = await bcrypt.hash('password123', 10);
    const usuario = Usuario.crear({
      id: 'uuid-1',
      email: 'test@test.com',
      rol: 'EMPLEADO',
      passwordHash: hash,
    });
    usuario.desactivar();
    mockRepo.findUsuarioByEmail.mockResolvedValue(usuario);

    await expect(
      useCase.execute({ email: 'test@test.com', password: 'password123' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
