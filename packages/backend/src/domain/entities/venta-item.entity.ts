import { DomainError } from '../errors/domain.error';
import { Precio } from '../value-objects/precio.vo';

export class VentaItem {
  private constructor(
    private readonly _id: string,
    private readonly _varianteId: string,
    private readonly _cantidad: number,
    private readonly _precioSnapshot: Precio,
  ) {}

  static crear(props: {
    id: string;
    varianteId: string;
    cantidad: number;
    precioSnapshot: number;
  }): VentaItem {
    if (!props.id || props.id.trim().length === 0) {
      throw new DomainError(
        'El ID del item no puede estar vacio',
        'VENTA_ITEM_ID_VACIO',
      );
    }
    if (!props.varianteId || props.varianteId.trim().length === 0) {
      throw new DomainError(
        'El VarianteId no puede estar vacio',
        'VENTA_ITEM_VARIANTE_VACIO',
      );
    }
    if (!Number.isInteger(props.cantidad) || props.cantidad <= 0) {
      throw new DomainError(
        'La cantidad debe ser un entero mayor que 0',
        'VENTA_ITEM_CANTIDAD_INVALIDA',
      );
    }
    const precioSnapshot = Precio.crear(props.precioSnapshot);
    return new VentaItem(
      props.id,
      props.varianteId,
      props.cantidad,
      precioSnapshot,
    );
  }

  get subtotal(): number {
    return Math.round(this._cantidad * this._precioSnapshot.valor * 100) / 100;
  }

  get id(): string {
    return this._id;
  }
  get varianteId(): string {
    return this._varianteId;
  }
  get cantidad(): number {
    return this._cantidad;
  }
  get precioSnapshot(): Precio {
    return this._precioSnapshot;
  }
}
