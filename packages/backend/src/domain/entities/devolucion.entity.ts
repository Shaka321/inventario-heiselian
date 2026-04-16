import { DomainError } from '../errors/domain.error';

export class Devolucion {
  private constructor(
    private readonly _id: string,
    private readonly _ventaId: string,
    private readonly _justificacion: string,
    private readonly _creadoEn: Date,
  ) {}

  static crear(props: {
    id: string;
    ventaId: string;
    justificacion: string;
    fechaVenta: Date;
    plazoMaximoDias?: number;
  }): Devolucion {
    if (!props.id || props.id.trim().length === 0) {
      throw new DomainError('El ID de la devolucion no puede estar vacio', 'DEVOLUCION_ID_VACIO');
    }
    if (!props.ventaId || props.ventaId.trim().length === 0) {
      throw new DomainError('La devolucion debe estar asociada a una venta', 'DEVOLUCION_VENTA_VACIO');
    }
    if (!props.justificacion || props.justificacion.trim().length < 20) {
      throw new DomainError(
        'La justificacion debe tener al menos 20 caracteres',
        'DEVOLUCION_JUSTIFICACION_CORTA',
      );
    }
    const plazo = props.plazoMaximoDias ?? 30;
    const ahora = new Date();
    const diasTranscurridos = Math.floor(
      (ahora.getTime() - props.fechaVenta.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diasTranscurridos > plazo) {
      throw new DomainError(
        `El plazo para devolucion vencio. Maximo ${plazo} dias, transcurridos ${diasTranscurridos}`,
        'DEVOLUCION_FUERA_DE_PLAZO',
      );
    }
    return new Devolucion(props.id, props.ventaId, props.justificacion.trim(), new Date());
  }

  get id(): string { return this._id; }
  get ventaId(): string { return this._ventaId; }
  get justificacion(): string { return this._justificacion; }
  get creadoEn(): Date { return this._creadoEn; }
}
