export interface IPrecioHistorial {
  id: string;
  varianteId: string;
  usuarioId: string;
  precioAnterior: number;
  precioNuevo: number;
  fecha: Date;
}

export interface IPrecioRepository {
  getCurrentPrice(varianteId: string): Promise<number>;
  updatePrice(varianteId: string, nuevoPrecio: number): Promise<void>;
  saveHistorial(historial: IPrecioHistorial): Promise<void>;
  getPriceHistory(varianteId: string): Promise<IPrecioHistorial[]>;
}

export const I_PRECIO_REPOSITORY = Symbol('IPrecioRepository');
