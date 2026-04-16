import { Variante } from '../variante.entity';
import { DomainError } from '../../errors/domain.error';

const props = {
  id: 'var-1',
  productoId: 'prod-1',
  sku: 'ARR-001',
  precio: 10.0,
  costo: 7.0,
  stock: 100,
};

describe('Variante', () => {
  describe('crear()', () => {
    it('crea una variante valida', () => {
      const v = Variante.crear(props);
      expect(v.id).toBe('var-1');
      expect(v.sku.valor).toBe('ARR-001');
      expect(v.precio.valor).toBe(10);
      expect(v.stock.cantidad).toBe(100);
      expect(v.activo).toBe(true);
    });
    it('rechaza precio menor que costo', () => {
      expect(() => Variante.crear({ ...props, precio: 5, costo: 7 })).toThrow(
        DomainError,
      );
    });
    it('rechaza precio igual al costo', () => {
      expect(() => Variante.crear({ ...props, precio: 7, costo: 7 })).toThrow(
        DomainError,
      );
    });
    it('rechaza stock negativo', () => {
      expect(() => Variante.crear({ ...props, stock: -1 })).toThrow(
        DomainError,
      );
    });
    it('rechaza SKU invalido', () => {
      expect(() => Variante.crear({ ...props, sku: 'AB' })).toThrow(
        DomainError,
      );
    });
    it('rechaza productoId vacio', () => {
      expect(() => Variante.crear({ ...props, productoId: '' })).toThrow(
        DomainError,
      );
    });
  });

  describe('reducirStock()', () => {
    it('reduce el stock correctamente', () => {
      const v = Variante.crear(props);
      v.reducirStock(10);
      expect(v.stock.cantidad).toBe(90);
    });
    it('lanza error si no hay suficiente stock', () => {
      const v = Variante.crear(props);
      expect(() => v.reducirStock(200)).toThrow(DomainError);
    });
  });

  describe('aumentarStock()', () => {
    it('aumenta el stock correctamente', () => {
      const v = Variante.crear(props);
      v.aumentarStock(50);
      expect(v.stock.cantidad).toBe(150);
    });
  });

  describe('actualizarPrecio()', () => {
    it('actualiza precio y costo validos', () => {
      const v = Variante.crear(props);
      v.actualizarPrecio(15, 10);
      expect(v.precio.valor).toBe(15);
      expect(v.costo.valor).toBe(10);
    });
    it('rechaza si nuevo precio es menor que nuevo costo', () => {
      const v = Variante.crear(props);
      expect(() => v.actualizarPrecio(8, 10)).toThrow(DomainError);
    });
  });

  describe('desactivar()', () => {
    it('desactiva la variante', () => {
      const v = Variante.crear(props);
      v.desactivar();
      expect(v.activo).toBe(false);
    });
    it('lanza error si ya esta desactivada', () => {
      const v = Variante.crear(props);
      v.desactivar();
      expect(() => v.desactivar()).toThrow(DomainError);
    });
  });
});
