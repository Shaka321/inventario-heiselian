import { DomainError } from '../errors/domain.error';

export class SKU {
  private static readonly PATRON = /^[A-Z0-9-]{3,20}$/;

  private constructor(private readonly _valor: string) {}

  static crear(valor: string): SKU {
    if (!valor || typeof valor !== 'string') {
      throw new DomainError('El SKU no puede estar vacio', 'SKU_VACIO');
    }
    const normalizado = valor.trim().toUpperCase();
    if (!SKU.PATRON.test(normalizado)) {
      throw new DomainError(
        'El SKU debe tener entre 3 y 20 caracteres alfanumericos o guiones',
        'SKU_FORMATO_INVALIDO',
      );
    }
    return new SKU(normalizado);
  }

  get valor(): string {
    return this._valor;
  }

  equals(otro: SKU): boolean {
    return this._valor === otro._valor;
  }

  toString(): string {
    return this._valor;
  }
}
