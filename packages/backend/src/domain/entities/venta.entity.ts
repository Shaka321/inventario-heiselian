import { DomainError } from '../errors/domain.error';
import { Precio } from '../value-objects/precio.vo';
import { VentaItem } from './venta-item.entity';

export enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  QR = 'QR',
}

export enum EstadoVenta {
  PENDIENTE = 'PENDIENTE',
  COMPLETADA = 'COMPLETADA',
  ANULADA = 'ANULADA',
}

export class Venta {
  private constructor(
    private readonly _id: string,
    private readonly _usuarioId: string,
    private readonly _items: VentaItem[],
    private readonly _total: Precio,
    private readonly _metodoPago: MetodoPago,
    private _estado: EstadoVenta,
    private readonly _creadoEn: Date,
  ) {}

  static crear(props: {
    id: string;
    usuarioId: string;
    items: VentaItem[];
    metodoPago: string;
  }): Venta {
    if (!props.id || props.id.trim().length === 0) {
      throw new DomainError('El ID de la venta no puede estar vacio', 'VENTA_ID_VACIO');
    }
    if (!props.usuarioId || props.usuarioId.trim().length === 0) {
      throw new DomainError('El UsuarioId no puede estar vacio', 'VENTA_USUARIO_VACIO');
    }
    if (!props.items || props.items.length === 0) {
      throw new DomainError('La venta debe tener al menos un item', 'VENTA_SIN_ITEMS');
    }
    const metodoPago = props.metodoPago?.toUpperCase();
    if (!Object.values(MetodoPago).includes(metodoPago as MetodoPago)) {
      throw new DomainError(
        `Metodo de pago invalido. Valores: ${Object.values(MetodoPago).join(', ')}`,
        'VENTA_METODO_PAGO_INVALIDO',
      );
    }
    const sumaItems = props.items.reduce((acc, item) => acc + item.subtotal, 0);
    const totalRedondeado = Math.round(sumaItems * 100) / 100;
    const total = Precio.crear(totalRedondeado);

    return new Venta(
      props.id,
      props.usuarioId,
      [...props.items],
      total,
      metodoPago as MetodoPago,
      EstadoVenta.PENDIENTE,
      new Date(),
    );
  }

  completar(): void {
    if (this._estado !== EstadoVenta.PENDIENTE) {
      throw new DomainError('Solo se puede completar una venta pendiente', 'VENTA_ESTADO_INVALIDO');
    }
    this._estado = EstadoVenta.COMPLETADA;
  }

  anular(): void {
    if (this._estado === EstadoVenta.ANULADA) {
      throw new DomainError('La venta ya esta anulada', 'VENTA_YA_ANULADA');
    }
    this._estado = EstadoVenta.ANULADA;
  }

  get id(): string { return this._id; }
  get usuarioId(): string { return this._usuarioId; }
  get items(): VentaItem[] { return [...this._items]; }
  get total(): Precio { return this._total; }
  get metodoPago(): MetodoPago { return this._metodoPago; }
  get estado(): EstadoVenta { return this._estado; }
  get creadoEn(): Date { return this._creadoEn; }
}
