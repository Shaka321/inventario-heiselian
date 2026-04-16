import { Venta, EstadoVenta, MetodoPago } from '../venta.entity';
import { VentaItem } from '../venta-item.entity';
import { DomainError } from '../../errors/domain.error';

const item1 = VentaItem.crear({ id: 'item-1', varianteId: 'var-1', cantidad: 2, precioSnapshot: 10 });
const item2 = VentaItem.crear({ id: 'item-2', varianteId: 'var-2', cantidad: 1, precioSnapshot: 5 });

const props = {
  id: 'venta-1',
  usuarioId: 'user-1',
  items: [item1, item2],
  metodoPago: 'EFECTIVO',
};

describe('Venta', () => {
  describe('crear()', () => {
    it('crea una venta valida', () => {
      const v = Venta.crear(props);
      expect(v.id).toBe('venta-1');
      expect(v.estado).toBe(EstadoVenta.PENDIENTE);
      expect(v.metodoPago).toBe(MetodoPago.EFECTIVO);
    });
    it('calcula total como suma de items', () => {
      const v = Venta.crear(props);
      expect(v.total.valor).toBe(25);
    });
    it('rechaza venta sin items', () => {
      expect(() => Venta.crear({ ...props, items: [] })).toThrow(DomainError);
    });
    it('rechaza metodo de pago invalido', () => {
      expect(() => Venta.crear({ ...props, metodoPago: 'BITCOIN' })).toThrow(DomainError);
    });
    it('acepta metodo de pago en minusculas', () => {
      const v = Venta.crear({ ...props, metodoPago: 'tarjeta' });
      expect(v.metodoPago).toBe(MetodoPago.TARJETA);
    });
    it('rechaza usuarioId vacio', () => {
      expect(() => Venta.crear({ ...props, usuarioId: '' })).toThrow(DomainError);
    });
  });

  describe('completar()', () => {
    it('completa una venta pendiente', () => {
      const v = Venta.crear(props);
      v.completar();
      expect(v.estado).toBe(EstadoVenta.COMPLETADA);
    });
    it('lanza error si se completa dos veces', () => {
      const v = Venta.crear(props);
      v.completar();
      expect(() => v.completar()).toThrow(DomainError);
    });
  });

  describe('anular()', () => {
    it('anula una venta pendiente', () => {
      const v = Venta.crear(props);
      v.anular();
      expect(v.estado).toBe(EstadoVenta.ANULADA);
    });
    it('lanza error si ya esta anulada', () => {
      const v = Venta.crear(props);
      v.anular();
      expect(() => v.anular()).toThrow(DomainError);
    });
  });
});
