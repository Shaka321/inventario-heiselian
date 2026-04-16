import { DomainError } from '../errors/domain.error';

export class Email {
  private static readonly PATRON = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(private readonly _valor: string) {}

  static crear(valor: string): Email {
    if (!valor || typeof valor !== 'string') {
      throw new DomainError('El email no puede estar vacio', 'EMAIL_VACIO');
    }
    const normalizado = valor.trim().toLowerCase();
    if (!Email.PATRON.test(normalizado)) {
      throw new DomainError('El formato del email es invalido', 'EMAIL_FORMATO_INVALIDO');
    }
    if (normalizado.length > 254) {
      throw new DomainError('El email es demasiado largo', 'EMAIL_DEMASIADO_LARGO');
    }
    return new Email(normalizado);
  }

  get valor(): string { return this._valor; }

  equals(otro: Email): boolean { return this._valor === otro._valor; }

  toString(): string { return this._valor; }
}
