import { Producto } from '../producto.entity';
import { DomainError } from '../../errors/domain.error';

const props = { id: 'prod-1', nombre: 'Arroz', categoriaId: 'cat-1' };

describe('Producto', () => {
  describe('crear()', () => {
    it('crea un producto valido', () => {
      const p = Producto.crear(props);
      expect(p.id).toBe('prod-1');
      expect(p.nombre).toBe('Arroz');
      expect(p.activo).toBe(true);
    });
    it('rechaza nombre menor a 2 chars', () => {
      expect(() => Producto.crear({ ...props, nombre: 'A' })).toThrow(DomainError);
    });
    it('rechaza nombre vacio', () => {
      expect(() => Producto.crear({ ...props, nombre: '' })).toThrow(DomainError);
    });
    it('rechaza id vacio', () => {
      expect(() => Producto.crear({ ...props, id: '' })).toThrow(DomainError);
    });
    it('rechaza categoriaId vacio', () => {
      expect(() => Producto.crear({ ...props, categoriaId: '' })).toThrow(DomainError);
    });
  });

  describe('cambiarNombre()', () => {
    it('cambia el nombre correctamente', () => {
      const p = Producto.crear(props);
      p.cambiarNombre('Arroz Premium');
      expect(p.nombre).toBe('Arroz Premium');
    });
    it('rechaza nombre invalido al cambiar', () => {
      const p = Producto.crear(props);
      expect(() => p.cambiarNombre('X')).toThrow(DomainError);
    });
  });

  describe('desactivar()', () => {
    it('desactiva un producto activo', () => {
      const p = Producto.crear(props);
      p.desactivar();
      expect(p.activo).toBe(false);
    });
    it('lanza error si ya esta desactivado', () => {
      const p = Producto.crear(props);
      p.desactivar();
      expect(() => p.desactivar()).toThrow(DomainError);
    });
  });
});
