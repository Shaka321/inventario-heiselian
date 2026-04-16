import { VentaItem } from '../venta-item.entity';
import { DomainError } from '../../errors/domain.error';

const props = {
  id: 'item-1',
  varianteId: 'var-1',
  cantidad: 3,
  precioSnapshot: 10.0,
};

describe('VentaItem', () => {
  it('crea un item valido', () => {
    const item = VentaItem.crear(props);
    expect(item.cantidad).toBe(3);
    expect(item.precioSnapshot.valor).toBe(10);
  });
  it('calcula subtotal correctamente', () => {
    expect(VentaItem.crear(props).subtotal).toBe(30);
  });
  it('rechaza cantidad 0', () => {
    expect(() => VentaItem.crear({ ...props, cantidad: 0 })).toThrow(
      DomainError,
    );
  });
  it('rechaza cantidad negativa', () => {
    expect(() => VentaItem.crear({ ...props, cantidad: -1 })).toThrow(
      DomainError,
    );
  });
  it('rechaza cantidad decimal', () => {
    expect(() => VentaItem.crear({ ...props, cantidad: 1.5 })).toThrow(
      DomainError,
    );
  });
  it('rechaza precioSnapshot 0', () => {
    expect(() => VentaItem.crear({ ...props, precioSnapshot: 0 })).toThrow(
      DomainError,
    );
  });
  it('rechaza varianteId vacio', () => {
    expect(() => VentaItem.crear({ ...props, varianteId: '' })).toThrow(
      DomainError,
    );
  });
  it('congela el precio (precio snapshot inmutable)', () => {
    const item = VentaItem.crear(props);
    expect(item.precioSnapshot.valor).toBe(10);
  });
});
