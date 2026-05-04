import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../infrastructure/jwt.strategy';
import { ConfigService } from '@nestjs/config';

jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('mock-public-key'),
}));

jest.mock('@nestjs/passport', () => ({
  PassportStrategy: (Strategy: new (...args: unknown[]) => object) => {
    return class extends (Strategy as new (...args: unknown[]) => object) {
      constructor(...args: unknown[]) {
        super(...args);
      }
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

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_PUBLIC_KEY_PATH') return 'keys/public.pem';
        return undefined;
      }),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(configService);
  });

  it('valida payload completo correctamente', () => {
    const payload = { sub: 'user-1', email: 'test@test.com', rol: 'DUENO', sessionId: 'session-1' };
    const result = strategy.validate(payload);
    expect(result).toEqual({ id: 'user-1', email: 'test@test.com', rol: 'DUENO', sessionId: 'session-1' });
  });

  it('rechaza payload sin sub', () => {
    expect(() => strategy.validate({ sub: '', email: 'test@test.com', rol: 'DUENO', sessionId: 'session-1' })).toThrow(UnauthorizedException);
  });

  it('rechaza payload sin email', () => {
    expect(() => strategy.validate({ sub: 'user-1', email: '', rol: 'DUENO', sessionId: 'session-1' })).toThrow(UnauthorizedException);
  });

  it('rechaza payload sin rol', () => {
    expect(() => strategy.validate({ sub: 'user-1', email: 'test@test.com', rol: '', sessionId: 'session-1' })).toThrow(UnauthorizedException);
  });

  it('rechaza payload sin sessionId', () => {
    expect(() => strategy.validate({ sub: 'user-1', email: 'test@test.com', rol: 'DUENO', sessionId: '' })).toThrow(UnauthorizedException);
  });

  it('rechaza token con payload vacio', () => {
    expect(() => strategy.validate({} as never)).toThrow(UnauthorizedException);
  });
});