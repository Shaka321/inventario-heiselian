import { IpWhitelistGuard, IP_WHITELIST_KEY } from '../ip-whitelist.guard';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const mockReflector = { getAllAndOverride: jest.fn() };

const mockContext = (ip: string, forwarded?: string) => ({
  getHandler: () => ({}),
  getClass: () => ({}),
  switchToHttp: () => ({
    getRequest: () => ({
      ip,
      socket: { remoteAddress: ip },
      headers: forwarded ? { 'x-forwarded-for': forwarded } : {},
    }),
  }),
});

describe('IpWhitelistGuard', () => {
  let guard: IpWhitelistGuard;
  const originalEnv = process.env['IP_WHITELIST'];

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new IpWhitelistGuard(mockReflector as unknown as Reflector);
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env['IP_WHITELIST'];
    } else {
      process.env['IP_WHITELIST'] = originalEnv;
    }
  });

  it('permite acceso si el endpoint no requiere whitelist', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    expect(guard.canActivate(mockContext('1.2.3.4') as never)).toBe(true);
  });

  it('bloquea si IP_WHITELIST esta vacia', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    process.env['IP_WHITELIST'] = '';
    expect(() => guard.canActivate(mockContext('1.2.3.4') as never)).toThrow(ForbiddenException);
  });

  it('permite IP que esta en la whitelist', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    process.env['IP_WHITELIST'] = '192.168.1.1,192.168.1.2';
    expect(guard.canActivate(mockContext('192.168.1.1') as never)).toBe(true);
  });

  it('bloquea IP que NO esta en la whitelist', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    process.env['IP_WHITELIST'] = '192.168.1.1';
    expect(() => guard.canActivate(mockContext('10.0.0.1') as never)).toThrow(ForbiddenException);
  });

  it('extrae IP correctamente del header x-forwarded-for', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    process.env['IP_WHITELIST'] = '203.0.113.1';
    expect(
      guard.canActivate(mockContext('127.0.0.1', '203.0.113.1, 10.0.0.1') as never),
    ).toBe(true);
  });

  it('bloquea si x-forwarded-for tiene IP no permitida', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    process.env['IP_WHITELIST'] = '192.168.1.1';
    expect(() =>
      guard.canActivate(mockContext('127.0.0.1', '10.0.0.99, 192.168.1.1') as never),
    ).toThrow(ForbiddenException);
  });
});