import { SKU } from '../sku.vo';
import { DomainError } from '../../errors/domain.error';

describe('SKU', () => {
  it('crea SKU valido en mayusculas', () => {
    expect(SKU.crear('ABC-123').valor).toBe('ABC-123');
  });
  it('normaliza a mayusculas', () => {
    expect(SKU.crear('abc-123').valor).toBe('ABC-123');
  });
  it('rechaza SKU vacio', () => {
    expect(() => SKU.crear('')).toThrow(DomainError);
  });
  it('rechaza SKU menor a 3 chars', () => {
    expect(() => SKU.crear('AB')).toThrow(DomainError);
  });
  it('rechaza SKU mayor a 20 chars', () => {
    expect(() => SKU.crear('A'.repeat(21))).toThrow(DomainError);
  });
  it('rechaza caracteres especiales', () => {
    expect(() => SKU.crear('ABC@123')).toThrow(DomainError);
  });
});
