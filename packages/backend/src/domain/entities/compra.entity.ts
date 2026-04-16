import { DomainError } from '../errors/domain.error';
import { Precio } from '../value-objects/precio.vo';

export class Compra {
  private constructor(
    private readonly _id: string,
    private readonly _varianteId: string,
    private readonly _cantidadUnidades: number,
    private readonly _costoUnitario: Precio,
    private readonly _proveedorId: string,
    private readonly _creadoEn: Date,
  ) {}

  static crear(props: {
    id: string;
    varianteId: string;
    cantidadUnidades: number;
    costoUnitario: number;
    proveedorId: string;
  }): Compra {
    if (!props.id || props.id.trim().length === 0) {
      throw new DomainError('El ID de la compra no puede estar vacio', 'COMPRA_ID_VACIO');
    }
    if (!props.varianteId || props.varianteId.trim().length === 0) {
      throw new DomainError('El VarianteId no puede estar vacio', 'COMPRA_VARIANTE_VACIO');
    }
    if (!Number.isInteger(props.cantidadUnidades) || props.cantidadUnidades <= 0) {
      throw new DomainError('La cantidad de unidades debe ser un entero mayor que 0', 'COMPRA_CANTIDAD_INVALIDA');
    }
    if (!props.proveedorId || props.proveedorId.trim().length === 0) {
      throw new DomainError('El ProveedorId no puede estar vacio', 'COMPRA_PROVEEDOR_VACIO');
    }
    const costoUnitario = Precio.crear(props.costoUnitario);
    return new Compra(props.id, props.varianteId, props.cantidadUnidades, costoUnitario, props.proveedorId, new Date());
  }

  get totalCompra(): number {
    return Math.round(this._cantidadUnidades * this._costoUnitario.valor * 100) / 100;
  }

  get id(): string { return this._id; }
  get varianteId(): string { return this._varianteId; }
  get cantidadUnidades(): number { return this._cantidadUnidades; }
  get costoUnitario(): Precio { return this._costoUnitario; }
  get proveedorId(): string { return this._proveedorId; }
  get creadoEn(): Date { return this._creadoEn; }
}
