import { Stock } from '../stock.vo';
import { DomainError } from '../../errors/domain.error';

describe('Stock', () => {
  it('crea stock con valor 0', () => {
    expect(Stock.crear(0).cantidad).toBe(0);
  });
  it('crea stock positivo', () => {
    expect(Stock.crear(50).cantidad).toBe(50);
  });
  it('rechaza stock negativo', () => {
    expect(() => Stock.crear(-1)).toThrow(DomainError);
  });
  it('rechaza decimales', () => {
    expect(() => Stock.crear(1.5)).toThrow(DomainError);
  });
  it('reduce correctamente', () => {
    expect(Stock.crear(10).reducir(3).cantidad).toBe(7);
  });
  it('lanza error si se reduce mas del disponible', () => {
    expect(() => Stock.crear(5).reducir(6)).toThrow(DomainError);
  });
  it('permite reducir todo el stock a 0', () => {
    expect(Stock.crear(5).reducir(5).cantidad).toBe(0);
  });
  it('aumenta correctamente', () => {
    expect(Stock.crear(10).aumentar(5).cantidad).toBe(15);
  });
});
