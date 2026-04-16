import { PrecioHistorial } from '../precio-historial.entity';
import { DomainError } from '../../errors/domain.error';

const props = {
  id: 'ph-1',
  varianteId: 'var-1',
  precioAnterior: 10,
  precioNuevo: 12,
  fecha: new Date(Date.now() - 1000),
  usuarioId: 'user-1',
};

describe('PrecioHistorial', () => {
  it('crea un historial valido', () => {
    const ph = PrecioHistorial.crear(props);
    expect(ph.precioAnterior.valor).toBe(10);
    expect(ph.precioNuevo.valor).toBe(12);
  });
  it('rechaza fecha futura', () => {
    const fechaFutura = new Date(Date.now() + 1000 * 60 * 60);
    expect(() => PrecioHistorial.crear({ ...props, fecha: fechaFutura })).toThrow(DomainError);
  });
  it('rechaza precioAnterior 0', () => {
    expect(() => PrecioHistorial.crear({ ...props, precioAnterior: 0 })).toThrow(DomainError);
  });
  it('rechaza precioNuevo negativo', () => {
    expect(() => PrecioHistorial.crear({ ...props, precioNuevo: -5 })).toThrow(DomainError);
  });
  it('rechaza varianteId vacio', () => {
    expect(() => PrecioHistorial.crear({ ...props, varianteId: '' })).toThrow(DomainError);
  });
  it('rechaza usuarioId vacio', () => {
    expect(() => PrecioHistorial.crear({ ...props, usuarioId: '' })).toThrow(DomainError);
  });
});
