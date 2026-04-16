import { DomainError } from '../errors/domain.error';
import { Precio } from '../value-objects/precio.vo';

export class PrecioHistorial {
  private constructor(
    private readonly _id: string,
    private readonly _varianteId: string,
    private readonly _precioAnterior: Precio,
    private readonly _precioNuevo: Precio,
    private readonly _fecha: Date,
    private readonly _usuarioId: string,
  ) {}

  static crear(props: {
    id: string;
    varianteId: string;
    precioAnterior: number;
    precioNuevo: number;
    fecha: Date;
    usuarioId: string;
  }): PrecioHistorial {
    if (!props.id || props.id.trim().length === 0) {
      throw new DomainError(
        'El ID no puede estar vacio',
        'PRECIO_HISTORIAL_ID_VACIO',
      );
    }
    if (!props.varianteId || props.varianteId.trim().length === 0) {
      throw new DomainError(
        'El VarianteId no puede estar vacio',
        'PRECIO_HISTORIAL_VARIANTE_VACIO',
      );
    }
    if (!props.usuarioId || props.usuarioId.trim().length === 0) {
      throw new DomainError(
        'El UsuarioId no puede estar vacio',
        'PRECIO_HISTORIAL_USUARIO_VACIO',
      );
    }
    const ahora = new Date();
    if (props.fecha > ahora) {
      throw new DomainError(
        'La fecha no puede ser futura',
        'PRECIO_HISTORIAL_FECHA_FUTURA',
      );
    }
    const precioAnterior = Precio.crear(props.precioAnterior);
    const precioNuevo = Precio.crear(props.precioNuevo);
    return new PrecioHistorial(
      props.id,
      props.varianteId,
      precioAnterior,
      precioNuevo,
      props.fecha,
      props.usuarioId,
    );
  }

  get id(): string {
    return this._id;
  }
  get varianteId(): string {
    return this._varianteId;
  }
  get precioAnterior(): Precio {
    return this._precioAnterior;
  }
  get precioNuevo(): Precio {
    return this._precioNuevo;
  }
  get fecha(): Date {
    return this._fecha;
  }
  get usuarioId(): string {
    return this._usuarioId;
  }
}
