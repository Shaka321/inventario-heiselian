import { Compra } from '../compra.entity';
import { DomainError } from '../../errors/domain.error';

const props = { id: 'compra-1', varianteId: 'var-1', cantidadUnidades: 50, costoUnitario: 8.50, proveedorId: 'prov-1' };

describe('Compra', () => {
  it('crea una compra valida', () => {
    const c = Compra.crear(props);
    expect(c.cantidadUnidades).toBe(50);
    expect(c.costoUnitario.valor).toBe(8.50);
  });
  it('calcula total correctamente', () => {
    expect(Compra.crear(props).totalCompra).toBe(425);
  });
  it('rechaza cantidad 0', () => {
    expect(() => Compra.crear({ ...props, cantidadUnidades: 0 })).toThrow(DomainError);
  });
  it('rechaza cantidad negativa', () => {
    expect(() => Compra.crear({ ...props, cantidadUnidades: -5 })).toThrow(DomainError);
  });
  it('rechaza cantidad decimal', () => {
    expect(() => Compra.crear({ ...props, cantidadUnidades: 1.5 })).toThrow(DomainError);
  });
  it('rechaza costo 0', () => {
    expect(() => Compra.crear({ ...props, costoUnitario: 0 })).toThrow(DomainError);
  });
  it('rechaza proveedorId vacio', () => {
    expect(() => Compra.crear({ ...props, proveedorId: '' })).toThrow(DomainError);
  });
});
