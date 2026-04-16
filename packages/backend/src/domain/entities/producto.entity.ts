import { DomainError } from '../errors/domain.error';

export class Producto {
  private constructor(
    private readonly _id: string,
    private _nombre: string,
    private _categoriaId: string,
    private _activo: boolean,
  ) {}

  static crear(props: {
    id: string;
    nombre: string;
    categoriaId: string;
  }): Producto {
    if (!props.id || props.id.trim().length === 0) {
      throw new DomainError('El ID del producto no puede estar vacio', 'PRODUCTO_ID_VACIO');
    }
    if (!props.nombre || props.nombre.trim().length < 2) {
      throw new DomainError('El nombre del producto debe tener al menos 2 caracteres', 'PRODUCTO_NOMBRE_INVALIDO');
    }
    if (!props.categoriaId || props.categoriaId.trim().length === 0) {
      throw new DomainError('El CategoriaId no puede estar vacio', 'PRODUCTO_CATEGORIA_INVALIDA');
    }
    return new Producto(props.id, props.nombre.trim(), props.categoriaId.trim(), true);
  }

  cambiarNombre(nuevoNombre: string): void {
    if (!nuevoNombre || nuevoNombre.trim().length < 2) {
      throw new DomainError('El nombre del producto debe tener al menos 2 caracteres', 'PRODUCTO_NOMBRE_INVALIDO');
    }
    this._nombre = nuevoNombre.trim();
  }

  desactivar(): void {
    if (!this._activo) {
      throw new DomainError('El producto ya esta desactivado', 'PRODUCTO_YA_DESACTIVADO');
    }
    this._activo = false;
  }

  get id(): string { return this._id; }
  get nombre(): string { return this._nombre; }
  get categoriaId(): string { return this._categoriaId; }
  get activo(): boolean { return this._activo; }
}
