import { Devolucion } from '../devolucion.entity';
import { DomainError } from '../../errors/domain.error';

const fechaReciente = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2); // hace 2 dias
const props = {
  id: 'dev-1',
  ventaId: 'venta-1',
  justificacion: 'El producto estaba danado al momento de la entrega',
  fechaVenta: fechaReciente,
};

describe('Devolucion', () => {
  it('crea una devolucion valida', () => {
    const d = Devolucion.crear(props);
    expect(d.ventaId).toBe('venta-1');
    expect(d.justificacion).toBe(props.justificacion);
  });
  it('rechaza justificacion menor a 20 chars', () => {
    expect(() =>
      Devolucion.crear({ ...props, justificacion: 'Muy corta' }),
    ).toThrow(DomainError);
  });
  it('rechaza justificacion vacia', () => {
    expect(() => Devolucion.crear({ ...props, justificacion: '' })).toThrow(
      DomainError,
    );
  });
  it('rechaza si no tiene ventaId', () => {
    expect(() => Devolucion.crear({ ...props, ventaId: '' })).toThrow(
      DomainError,
    );
  });
  it('rechaza si la venta es muy antigua (fuera de plazo)', () => {
    const fechaAntigua = new Date(Date.now() - 1000 * 60 * 60 * 24 * 31); // hace 31 dias
    expect(() =>
      Devolucion.crear({ ...props, fechaVenta: fechaAntigua }),
    ).toThrow(DomainError);
  });
  it('acepta devolucion dentro del plazo personalizado', () => {
    const fechaMes = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5);
    const d = Devolucion.crear({
      ...props,
      fechaVenta: fechaMes,
      plazoMaximoDias: 10,
    });
    expect(d.id).toBe('dev-1');
  });
});
