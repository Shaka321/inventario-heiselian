import { Precio } from '../precio.vo';
import { DomainError } from '../../errors/domain.error';

describe('Precio', () => {
  it('crea un precio valido', () => {
    expect(Precio.crear(100).valor).toBe(100);
  });
  it('acepta decimales y los redondea a 2 cifras', () => {
    expect(Precio.crear(10.999).valor).toBe(11);
  });
  it('rechaza precio 0', () => {
    expect(() => Precio.crear(0)).toThrow(DomainError);
  });
  it('rechaza precio negativo', () => {
    expect(() => Precio.crear(-50)).toThrow(DomainError);
  });
  it('rechaza NaN', () => {
    expect(() => Precio.crear(NaN)).toThrow(DomainError);
  });
  it('rechaza Infinity', () => {
    expect(() => Precio.crear(Infinity)).toThrow(DomainError);
  });
  it('esMayorQue retorna true cuando es mayor', () => {
    expect(Precio.crear(200).esMayorQue(Precio.crear(100))).toBe(true);
  });
  it('esMayorQue retorna false cuando es igual', () => {
    expect(Precio.crear(100).esMayorQue(Precio.crear(100))).toBe(false);
  });
});
