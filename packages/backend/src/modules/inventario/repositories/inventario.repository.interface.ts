export interface ICompra {
  id: string;
  varianteId: string;
  proveedorId: string;
  cantidadUnidades: number;
  costoUnitario: number;
  creadoEn: Date;
}

export interface IInventarioRepository {
  registrarCompra(compra: ICompra): Promise<void>;
  incrementarStock(varianteId: string, cantidad: number): Promise<void>;
  ajustarStock(varianteId: string, nuevoStock: number): Promise<void>;
  getStockActual(varianteId: string): Promise<number>;
  findComprasByVariante(varianteId: string): Promise<ICompra[]>;
}

export const I_INVENTARIO_REPOSITORY = Symbol('IInventarioRepository');
