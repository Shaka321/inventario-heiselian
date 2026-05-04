import { RolesGuard } from '../roles.guard';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const mockReflector = { getAllAndOverride: jest.fn() };

const mockContext = (rol: string) => ({
  getHandler: () => ({}),
  getClass: () => ({}),
  switchToHttp: () => ({
    getRequest: () => ({ user: { id: 'u1', email: 'test@test.com', rol, sessionId: 's1' } }),
  }),
});

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new RolesGuard(mockReflector as unknown as Reflector);
  });

  it('permite acceso si no hay roles requeridos', () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    expect(guard.canActivate(mockContext('EMPLEADO') as never)).toBe(true);
  });

  it('permite acceso si el rol coincide', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['DUENO']);
    expect(guard.canActivate(mockContext('DUENO') as never)).toBe(true);
  });

  it('permite acceso si el rol esta en la lista', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['DUENO', 'SUPERVISOR']);
    expect(guard.canActivate(mockContext('SUPERVISOR') as never)).toBe(true);
  });

  it('lanza ForbiddenException si el rol no esta permitido', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['DUENO']);
    expect(() => guard.canActivate(mockContext('EMPLEADO') as never)).toThrow(ForbiddenException);
  });

  it('lanza ForbiddenException si EMPLEADO intenta acceder a ruta de DUENO', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['DUENO']);
    expect(() => guard.canActivate(mockContext('EMPLEADO') as never)).toThrow('No tienes permisos');
  });

  it('lanza ForbiddenException si SUPERVISOR intenta acceder a ruta solo DUENO', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['DUENO']);
    expect(() => guard.canActivate(mockContext('SUPERVISOR') as never)).toThrow(ForbiddenException);
  });
});