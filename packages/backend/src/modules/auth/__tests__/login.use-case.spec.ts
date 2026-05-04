import { LoginUseCase } from '../use-cases/login.use-case';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AccountLockoutService } from '../infrastructure/account-lockout.service';
import * as bcrypt from 'bcryptjs';

const mockUsuario = (rol = 'DUENO') => ({
  id: 'u1',
  email: { valor: 'test@test.com' },
  rol: { valor: rol },
  passwordHash: '',
});

const mockRepo = {
  findUsuarioByEmail: jest.fn(),
  saveRefreshToken: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-access-token'),
};

const mockLockout = {
  isLocked: jest.fn().mockResolvedValue(false),
  recordFailedAttempt: jest.fn().mockResolvedValue({ locked: false, attempts: 1 }),
  clearFailedAttempts: jest.fn().mockResolvedValue(undefined),
};

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLockout.isLocked.mockResolvedValue(false);
    mockLockout.recordFailedAttempt.mockResolvedValue({ locked: false, attempts: 1 });
    useCase = new LoginUseCase(
      mockRepo as never,
      mockJwtService as unknown as JwtService,
      mockLockout as unknown as AccountLockoutService,
    );
  });

  it('lanza UnauthorizedException si la cuenta esta bloqueada', async () => {
    mockLockout.isLocked.mockResolvedValue(true);
    await expect(
      useCase.execute({ email: 'test@test.com', password: 'any' }),
    ).rejects.toThrow('bloqueada');
  });

  it('lanza UnauthorizedException si el usuario no existe', async () => {
    mockRepo.findUsuarioByEmail.mockResolvedValue(null);
    await expect(
      useCase.execute({ email: 'no@existe.com', password: '123456' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(mockLockout.recordFailedAttempt).toHaveBeenCalled();
  });

  it('lanza UnauthorizedException si la password es incorrecta', async () => {
    const hash = await bcrypt.hash('correcta', 10);
    mockRepo.findUsuarioByEmail.mockResolvedValue({ ...mockUsuario(), passwordHash: hash });
    await expect(
      useCase.execute({ email: 'test@test.com', password: 'incorrecta' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(mockLockout.recordFailedAttempt).toHaveBeenCalled();
  });

  it('bloquea cuenta al 5to intento fallido', async () => {
    const hash = await bcrypt.hash('correcta', 10);
    mockRepo.findUsuarioByEmail.mockResolvedValue({ ...mockUsuario(), passwordHash: hash });
    mockLockout.recordFailedAttempt.mockResolvedValue({ locked: true, attempts: 5 });
    await expect(
      useCase.execute({ email: 'test@test.com', password: 'incorrecta' }),
    ).rejects.toThrow('bloqueada por multiples intentos');
  });

  it('retorna accessToken y rawRefreshToken con credenciales correctas', async () => {
    const hash = await bcrypt.hash('password123', 10);
    mockRepo.findUsuarioByEmail.mockResolvedValue({ ...mockUsuario(), passwordHash: hash });
    mockRepo.saveRefreshToken.mockResolvedValue(undefined);

    const result = await useCase.execute({ email: 'test@test.com', password: 'password123' });

    expect(result.tokens.accessToken).toBe('mock-access-token');
    expect(result.tokens.expiresIn).toBe(900);
    expect(result.rawRefreshToken).toBeDefined();
    expect(mockLockout.clearFailedAttempts).toHaveBeenCalled();
  });

  it('el payload JWT incluye sessionId y rol correcto', async () => {
    const hash = await bcrypt.hash('password123', 10);
    mockRepo.findUsuarioByEmail.mockResolvedValue({ ...mockUsuario('DUENO'), passwordHash: hash });
    mockRepo.saveRefreshToken.mockResolvedValue(undefined);

    await useCase.execute({ email: 'test@test.com', password: 'password123' });

    const signCall = mockJwtService.sign.mock.calls[0][0];
    expect(signCall.sessionId).toBeDefined();
    expect(signCall.sub).toBe('u1');
    expect(signCall.rol).toBe('DUENO');
  });
});