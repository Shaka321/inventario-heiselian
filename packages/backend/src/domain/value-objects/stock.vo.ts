import { DomainError } from '../errors/domain.error';

export class Stock {
  private constructor(private readonly _cantidad: number) {}

  static crear(cantidad: number): Stock {
    if (typeof cantidad !== 'number' || isNaN(cantidad)) {
      throw new DomainError('El stock debe ser un numero', 'STOCK_INVALIDO');
    }
    if (cantidad < 0) {
      throw new DomainError('El stock no puede ser negativo', 'STOCK_NEGATIVO');
    }
    if (!Number.isInteger(cantidad)) {
      throw new DomainError('El stock debe ser un numero entero', 'STOCK_NO_ENTERO');
    }
    return new Stock(cantidad);
  }

  get cantidad(): number { return this._cantidad; }

  reducir(cantidad: number): Stock {
    if (cantidad > this._cantidad) {
      throw new DomainError(
        `Stock insuficiente: disponible ${this._cantidad}, solicitado ${cantidad}`,
        'STOCK_INSUFICIENTE',
      );
    }
    return new Stock(this._cantidad - cantidad);
  }

  aumentar(cantidad: number): Stock { return Stock.crear(this._cantidad + cantidad); }

  equals(otro: Stock): boolean { return this._cantidad === otro._cantidad; }
}
