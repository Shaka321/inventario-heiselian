import { DomainError } from '../errors/domain.error';
import { Precio } from '../value-objects/precio.vo';
import { Stock } from '../value-objects/stock.vo';
import { SKU } from '../value-objects/sku.vo';

export class Variante {
  private constructor(
    private readonly _id: string,
    private readonly _productoId: string,
    private readonly _sku: SKU,
    private _precio: Precio,
    private _costo: Precio,
    private _stock: Stock,
    private _activo: boolean,
  ) {}

  static crear(props: {
    id: string;
    productoId: string;
    sku: string;
    precio: number;
    costo: number;
    stock: number;
  }): Variante {
    if (!props.id || props.id.trim().length === 0) {
      throw new DomainError('El ID de la variante no puede estar vacio', 'VARIANTE_ID_VACIO');
    }
    if (!props.productoId || props.productoId.trim().length === 0) {
      throw new DomainError('El ProductoId no puede estar vacio', 'VARIANTE_PRODUCTO_INVALIDO');
    }

    const sku = SKU.crear(props.sku);
    const precio = Precio.crear(props.precio);
    const costo = Precio.crear(props.costo);
    const stock = Stock.crear(props.stock);

    if (!precio.esMayorQue(costo)) {
      throw new DomainError(
        `El precio (${precio.valor}) debe ser mayor que el costo (${costo.valor})`,
        'VARIANTE_PRECIO_MENOR_COSTO',
      );
    }

    return new Variante(props.id, props.productoId, sku, precio, costo, stock, true);
  }

  reducirStock(cantidad: number): void {
    this._stock = this._stock.reducir(cantidad);
  }

  aumentarStock(cantidad: number): void {
    this._stock = this._stock.aumentar(cantidad);
  }

  actualizarPrecio(nuevoPrecio: number, nuevoCosto: number): void {
    const precio = Precio.crear(nuevoPrecio);
    const costo = Precio.crear(nuevoCosto);
    if (!precio.esMayorQue(costo)) {
      throw new DomainError(
        `El precio (${precio.valor}) debe ser mayor que el costo (${costo.valor})`,
        'VARIANTE_PRECIO_MENOR_COSTO',
      );
    }
    this._precio = precio;
    this._costo = costo;
  }

  desactivar(): void {
    if (!this._activo) {
      throw new DomainError('La variante ya esta desactivada', 'VARIANTE_YA_DESACTIVADA');
    }
    this._activo = false;
  }

  get id(): string { return this._id; }
  get productoId(): string { return this._productoId; }
  get sku(): SKU { return this._sku; }
  get precio(): Precio { return this._precio; }
  get costo(): Precio { return this._costo; }
  get stock(): Stock { return this._stock; }
  get activo(): boolean { return this._activo; }
}
