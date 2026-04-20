export type EstadoCaja = 'ABIERTA' | 'CERRADA';

export interface CierreCaja {
  id: string;
  usuarioId: string;
  fechaApertura: Date;
  fechaCierre?: Date;
  montoInicial: number;
  montoFinal?: number;
  montoEsperado?: number;
  diferencia?: number;
  totalVentas: number;
  totalDevoluciones: number;
  estado: EstadoCaja;
  notas?: string;
  creadoEn: Date;
}

export interface ICierreCajaRepository {
  abrir(data: {
    usuarioId: string;
    montoInicial: number;
    notas?: string;
  }): Promise<CierreCaja>;

  cerrar(data: {
    id: string;
    montoFinal: number;
    notas?: string;
  }): Promise<CierreCaja>;

  findAbierta(): Promise<CierreCaja | null>;
  findById(id: string): Promise<CierreCaja | null>;

  listar(filtros: {
    usuarioId?: string;
    estado?: EstadoCaja;
    page: number;
    limit: number;
  }): Promise<{ data: CierreCaja[]; total: number }>;

  calcularTotalesDelDia(
    desde: Date,
    hasta: Date,
  ): Promise<{
    totalVentas: number;
    totalDevoluciones: number;
    montoEsperado: number;
  }>;
}

export const I_CIERRE_CAJA_REPOSITORY = Symbol('ICierreCajaRepository');
