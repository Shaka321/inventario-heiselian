
export interface AjusteManual {
  id: string;
  varianteId: string;
  usuarioId: string;
  cantidadAnterior: number;
  cantidadNueva: number;
  diferencia: number;
  motivo: string;
  creadoEn: Date;
}

export interface IAjusteRepository {
  registrarAjuste(
    ajuste: Omit<AjusteManual, 'id' | 'creadoEn'>,
  ): Promise<AjusteManual>;
  listarAjustes(filtros: {
    varianteId?: string;
    usuarioId?: string;
    desde?: Date;
    hasta?: Date;
    page: number;
    limit: number;
  }): Promise<{ data: AjusteManual[]; total: number }>;
  findById(id: string): Promise<AjusteManual | null>;
  getStockActual(varianteId: string): Promise<number>;
  actualizarStock(varianteId: string, nuevaCantidad: number): Promise<void>;
}

export const I_AJUSTE_REPOSITORY = Symbol('IAjusteRepository');

