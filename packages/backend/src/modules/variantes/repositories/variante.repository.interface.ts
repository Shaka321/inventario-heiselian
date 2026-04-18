export interface IVariante {
  id: string;
  productoId: string;
  sku: string;
  precio: number;
  costo: number;
  stock: number;
  activo: boolean;
  creadoEn: Date;
}

export interface IVarianteRepository {
  findById(id: string): Promise<IVariante | null>;
  findBySku(sku: string): Promise<IVariante | null>;
  findByProductoId(productoId: string): Promise<IVariante[]>;
  save(variante: IVariante): Promise<void>;
  update(id: string, data: { sku?: string; precio?: number; costo?: number; activo?: boolean }): Promise<void>;
  updateStock(id: string, nuevoStock: number): Promise<void>;
  findAll(soloActivas?: boolean): Promise<IVariante[]>;
}

export const I_VARIANTE_REPOSITORY = Symbol('IVarianteRepository');
