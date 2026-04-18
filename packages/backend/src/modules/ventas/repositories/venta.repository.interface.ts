export interface IVentaItem {
  varianteId: string;
  cantidad: number;
  precioSnapshot: number;
}

export interface IVenta {
  id: string;
  usuarioId: string;
  total: number;
  metodoPago: string;
  estado: string;
  items: IVentaItem[];
  creadoEn: Date;
}

export interface IVentaRepository {
  registrarVenta(venta: IVenta): Promise<void>;
  findById(id: string): Promise<IVenta | null>;
  cancelarVenta(id: string): Promise<void>;
  listVentas(filters?: {
    usuarioId?: string;
    estado?: string;
  }): Promise<IVenta[]>;
}

export const I_VENTA_REPOSITORY = Symbol('IVentaRepository');
