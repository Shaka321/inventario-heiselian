import { Email } from '../email.vo';
import { DomainError } from '../../errors/domain.error';

describe('Email', () => {
  it('crea email valido en minusculas', () => {
    expect(Email.crear('USER@EXAMPLE.COM').valor).toBe('user@example.com');
  });
  it('rechaza email sin arroba', () => {
    expect(() => Email.crear('userexample.com')).toThrow(DomainError);
  });
  it('rechaza email sin dominio', () => {
    expect(() => Email.crear('user@')).toThrow(DomainError);
  });
  it('rechaza email vacio', () => {
    expect(() => Email.crear('')).toThrow(DomainError);
  });
  it('rechaza email con espacios', () => {
    expect(() => Email.crear('us er@example.com')).toThrow(DomainError);
  });
});
