export type EstadoConteo = 'EN_PROGRESO' | 'ENVIADO' | 'COMPARADO' | 'RESUELTO';

export interface ConteoItem {
  varianteId: string;
  cantidadContada: number;
  cantidadSistema?: number;
  diferencia?: number;
}

export interface ConteoInventario {
  id: string;
  iniciadoPorId: string;
  empleadoId?: string;
  estado: EstadoConteo;
  items: ConteoItem[];
  notas?: string;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface IConteoRepository {
  iniciar(data: {
    iniciadoPorId: string;
    varianteIds: string[];
    notas?: string;
  }): Promise<ConteoInventario>;

  findById(id: string): Promise<ConteoInventario | null>;

  findActivo(): Promise<ConteoInventario | null>;

  submitConteo(data: {
    id: string;
    empleadoId: string;
    items: { varianteId: string; cantidadContada: number }[];
  }): Promise<ConteoInventario>;

  compararConSistema(id: string): Promise<{
    conteo: ConteoInventario;
    discrepancias: {
      varianteId: string;
      cantidadContada: number;
      cantidadSistema: number;
      diferencia: number;
    }[];
    hayDiscrepancias: boolean;
  }>;

  resolver(id: string, aplicarAjuste: boolean): Promise<ConteoInventario>;

  getStockSistema(varianteIds: string[]): Promise<Record<string, number>>;
}

export const I_CONTEO_REPOSITORY = Symbol('IConteoRepository');
