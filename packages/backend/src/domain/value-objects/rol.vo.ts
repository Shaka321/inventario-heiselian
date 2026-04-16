import { DomainError } from '../errors/domain.error';

export enum RolValor {
  DUENO = 'DUENO',
  SUPERVISOR = 'SUPERVISOR',
  EMPLEADO = 'EMPLEADO',
}

export class Rol {
  private constructor(private readonly _valor: RolValor) {}

  static crear(valor: string): Rol {
    if (!valor) {
      throw new DomainError('El rol no puede estar vacio', 'ROL_VACIO');
    }
    const valorUpper = valor.toUpperCase();
    if (!Object.values(RolValor).includes(valorUpper as RolValor)) {
      throw new DomainError(
        `Rol invalido. Valores permitidos: ${Object.values(RolValor).join(', ')}`,
        'ROL_INVALIDO',
      );
    }
    return new Rol(valorUpper as RolValor);
  }

  get valor(): RolValor {
    return this._valor;
  }

  esDueno(): boolean {
    return this._valor === RolValor.DUENO;
  }

  esSupervisorOSuperior(): boolean {
    return [RolValor.DUENO, RolValor.SUPERVISOR].includes(this._valor);
  }

  equals(otro: Rol): boolean {
    return this._valor === otro._valor;
  }

  toString(): string {
    return this._valor;
  }
}
