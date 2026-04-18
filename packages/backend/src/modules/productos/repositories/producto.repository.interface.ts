export interface IProducto {
  id: string;
  nombre: string;
  categoriaId: string;
  activo: boolean;
  creadoEn: Date;
}

export interface IProductoRepository {
  findById(id: string): Promise<IProducto | null>;
  findByNombre(nombre: string, categoriaId: string): Promise<IProducto | null>;
  save(producto: IProducto): Promise<void>;
  update(id: string, data: { nombre?: string; categoriaId?: string }): Promise<void>;
  softDelete(id: string): Promise<void>;
  findAll(soloActivos?: boolean): Promise<IProducto[]>;
}

export const I_PRODUCTO_REPOSITORY = Symbol('IProductoRepository');
