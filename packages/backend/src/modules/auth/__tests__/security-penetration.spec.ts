import { JwtStrategy } from '../infrastructure/jwt.strategy';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { IpWhitelistGuard } from '../../../shared/guards/ip-whitelist.guard';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { createSign } from 'crypto';
import { generateKeyPairSync } from 'crypto';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

jest.mock('@nestjs/passport', () => ({
  PassportStrategy: (Strategy: new (...args: unknown[]) => object) => {
    return class extends (Strategy as new (...args: unknown[]) => object) {
      constructor(...args: unknown[]) { super(...args); }
    };
  },
}));

jest.mock('passport-jwt', () => ({
  ExtractJwt: { fromAuthHeaderAsBearerToken: jest.fn().mockReturnValue(jest.fn()) },
  Strategy: class MockStrategy {
    name = 'jwt';
    constructor(_opts: unknown, _verify: unknown) {}
  },
}));

const mockReflector = { getAllAndOverride: jest.fn() };

describe('Tests de penetracion — Seguridad', () => {
  let jwtStrategy: JwtStrategy;
  let rolesGuard: RolesGuard;
  let ipGuard: IpWhitelistGuard;

  beforeEach(() => {
    jest.clearAllMocks();

    const { readFileSync } = require('fs');
    (readFileSync as jest.Mock).mockReturnValue('mock-public-key');

    const configService = {
      get: jest.fn().mockReturnValue('keys/public.pem'),
    } as unknown as ConfigService;

    jwtStrategy = new JwtStrategy(configService);
    rolesGuard = new RolesGuard(mockReflector as unknown as Reflector);
    ipGuard = new IpWhitelistGuard(mockReflector as unknown as Reflector);
  });

  describe('JWT — bypass de token', () => {
    it('rechaza token con payload vacio', () => {
      expect(() => jwtStrategy.validate({} as never)).toThrow(UnauthorizedException);
    });

    it('rechaza token sin sub', () => {
      expect(() => jwtStrategy.validate({
        sub: '', email: 'x@x.com', rol: 'DUENO', sessionId: 's1',
      })).toThrow(UnauthorizedException);
    });

    it('rechaza token sin sessionId (replay attack mitigado)', () => {
      expect(() => jwtStrategy.validate({
        sub: 'u1', email: 'x@x.com', rol: 'DUENO', sessionId: '',
      })).toThrow(UnauthorizedException);
    });

    it('rechaza token con rol vacio', () => {
      expect(() => jwtStrategy.validate({
        sub: 'u1', email: 'x@x.com', rol: '', sessionId: 's1',
      })).toThrow(UnauthorizedException);
    });

    it('rechaza token con rol inventado', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['DUENO']);
      const ctx = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user: { rol: 'ADMIN_FALSO', id: 'u1', email: 'x@x.com', sessionId: 's1' } }),
        }),
      };
      expect(() => rolesGuard.canActivate(ctx as never)).toThrow(ForbiddenException);
    });
  });

  describe('RBAC — escalada de privilegios', () => {
    const makeCtx = (rol: string) => ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 'u1', email: 'x@x.com', rol, sessionId: 's1' } }),
      }),
    });

    it('EMPLEADO no puede acceder a rutas de DUENO', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['DUENO']);
      expect(() => rolesGuard.canActivate(makeCtx('EMPLEADO') as never)).toThrow(ForbiddenException);
    });

    it('EMPLEADO no puede acceder a rutas de SUPERVISOR', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['DUENO', 'SUPERVISOR']);
      expect(() => rolesGuard.canActivate(makeCtx('EMPLEADO') as never)).toThrow(ForbiddenException);
    });

    it('SUPERVISOR no puede acceder a rutas solo de DUENO', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['DUENO']);
      expect(() => rolesGuard.canActivate(makeCtx('SUPERVISOR') as never)).toThrow(ForbiddenException);
    });

    it('DUENO puede acceder a rutas de DUENO', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['DUENO']);
      expect(rolesGuard.canActivate(makeCtx('DUENO') as never)).toBe(true);
    });
  });

  describe('IP Whitelist — acceso desde red externa', () => {
    const makeCtx = (ip: string) => ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ ip, socket: { remoteAddress: ip }, headers: {} }),
      }),
    });

    beforeEach(() => {
      process.env['IP_WHITELIST'] = '192.168.1.100';
    });

    afterEach(() => {
      delete process.env['IP_WHITELIST'];
    });

    it('bloquea IP externa no autorizada', () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);
      expect(() => ipGuard.canActivate(makeCtx('8.8.8.8') as never)).toThrow(ForbiddenException);
    });

    it('bloquea IP de localhost si no esta en whitelist', () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);
      expect(() => ipGuard.canActivate(makeCtx('127.0.0.1') as never)).toThrow(ForbiddenException);
    });

    it('permite IP de la tienda', () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);
      expect(ipGuard.canActivate(makeCtx('192.168.1.100') as never)).toBe(true);
    });

    it('bloquea si whitelist vacia — fail secure', () => {
      process.env['IP_WHITELIST'] = '';
      mockReflector.getAllAndOverride.mockReturnValue(true);
      expect(() => ipGuard.canActivate(makeCtx('192.168.1.100') as never)).toThrow(ForbiddenException);
    });
  });
});