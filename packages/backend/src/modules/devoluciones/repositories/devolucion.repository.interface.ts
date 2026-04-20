export type EstadoDevolucion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface DevolucionItem {
  varianteId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Devolucion {
  id: string;
  ventaId: string;
  usuarioId: string;
  aprobadoPorId?: string;
  motivo: string;
  estado: EstadoDevolucion;
  items: DevolucionItem[];
  totalDevuelto: number;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface IDevolucionRepository {
  crear(data: {
    ventaId: string;
    usuarioId: string;
    motivo: string;
    items: DevolucionItem[];
  }): Promise<Devolucion>;
  findById(id: string): Promise<Devolucion | null>;
  findByVentaId(ventaId: string): Promise<Devolucion[]>;
  aprobar(id: string, aprobadoPorId: string): Promise<Devolucion>;
  rechazar(id: string, aprobadoPorId: string): Promise<Devolucion>;
  listar(filtros: {
    estado?: EstadoDevolucion;
    usuarioId?: string;
    desde?: Date;
    hasta?: Date;
    page: number;
    limit: number;
  }): Promise<{ data: Devolucion[]; total: number }>;
  getVentaConItems(ventaId: string): Promise<{
    id: string;
    estado: string;
    items: { varianteId: string; cantidad: number; precioUnitario: number }[];
  } | null>;
  reingresarStock(items: DevolucionItem[]): Promise<void>;
}

export const I_DEVOLUCION_REPOSITORY = Symbol('IDevolucionRepository');
