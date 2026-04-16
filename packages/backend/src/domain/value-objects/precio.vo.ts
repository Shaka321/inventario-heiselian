import { DomainError } from '../errors/domain.error';

export class Precio {
  private constructor(private readonly _valor: number) {}

  static crear(valor: number): Precio {
    if (typeof valor !== 'number' || isNaN(valor)) {
      throw new DomainError('El precio debe ser un numero', 'PRECIO_INVALIDO');
    }
    if (valor <= 0) {
      throw new DomainError('El precio debe ser mayor que 0', 'PRECIO_NO_POSITIVO');
    }
    if (!Number.isFinite(valor)) {
      throw new DomainError('El precio no puede ser infinito', 'PRECIO_INFINITO');
    }
    return new Precio(Math.round(valor * 100) / 100);
  }

  get valor(): number { return this._valor; }

  esMayorQue(otro: Precio): boolean { return this._valor > otro._valor; }

  equals(otro: Precio): boolean { return this._valor === otro._valor; }

  toString(): string { return this._valor.toFixed(2); }
}
