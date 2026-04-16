import { DomainError } from '../errors/domain.error';

export class CierreCaja {
  private constructor(
    private readonly _id: string,
    private readonly _usuarioId: string,
    private readonly _montoEsperado: number,
    private readonly _montoReal: number,
    private readonly _diferencia: number,
    private readonly _creadoEn: Date,
  ) {}

  static crear(props: {
    id: string;
    usuarioId: string;
    montoEsperado: number;
    montoReal: number;
  }): CierreCaja {
    if (!props.id || props.id.trim().length === 0) {
      throw new DomainError(
        'El ID no puede estar vacio',
        'CIERRE_CAJA_ID_VACIO',
      );
    }
    if (!props.usuarioId || props.usuarioId.trim().length === 0) {
      throw new DomainError(
        'El UsuarioId no puede estar vacio',
        'CIERRE_CAJA_USUARIO_VACIO',
      );
    }
    if (typeof props.montoEsperado !== 'number' || props.montoEsperado < 0) {
      throw new DomainError(
        'El monto esperado debe ser mayor o igual a 0',
        'CIERRE_CAJA_MONTO_ESPERADO_INVALIDO',
      );
    }
    if (typeof props.montoReal !== 'number' || props.montoReal < 0) {
      throw new DomainError(
        'El monto real debe ser mayor o igual a 0',
        'CIERRE_CAJA_MONTO_REAL_INVALIDO',
      );
    }
    const diferencia =
      Math.round((props.montoReal - props.montoEsperado) * 100) / 100;
    return new CierreCaja(
      props.id,
      props.usuarioId,
      props.montoEsperado,
      props.montoReal,
      diferencia,
      new Date(),
    );
  }

  get tieneFaltante(): boolean {
    return this._diferencia < 0;
  }
  get tieneSobrante(): boolean {
    return this._diferencia > 0;
  }
  get estaBalanceado(): boolean {
    return this._diferencia === 0;
  }

  get id(): string {
    return this._id;
  }
  get usuarioId(): string {
    return this._usuarioId;
  }
  get montoEsperado(): number {
    return this._montoEsperado;
  }
  get montoReal(): number {
    return this._montoReal;
  }
  get diferencia(): number {
    return this._diferencia;
  }
  get creadoEn(): Date {
    return this._creadoEn;
  }
}
