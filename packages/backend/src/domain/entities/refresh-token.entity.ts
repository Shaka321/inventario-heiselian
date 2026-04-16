import { DomainError } from '../errors/domain.error';

const DIAS_EXPIRACION = 7;

export class RefreshToken {
  private constructor(
    private readonly _id: string,
    private readonly _usuarioId: string,
    private readonly _tokenHash: string,
    private readonly _expiraEn: Date,
    private _revocado: boolean,
    private readonly _creadoEn: Date,
  ) {}

  static crear(props: {
    id: string;
    usuarioId: string;
    tokenHash: string;
  }): RefreshToken {
    if (!props.id || props.id.trim().length === 0) {
      throw new DomainError('El ID no puede estar vacio', 'REFRESH_TOKEN_ID_VACIO');
    }
    if (!props.usuarioId || props.usuarioId.trim().length === 0) {
      throw new DomainError('El UsuarioId no puede estar vacio', 'REFRESH_TOKEN_USUARIO_VACIO');
    }
    if (!props.tokenHash || props.tokenHash.trim().length === 0) {
      throw new DomainError('El tokenHash no puede estar vacio', 'REFRESH_TOKEN_HASH_VACIO');
    }
    const ahora = new Date();
    const expiraEn = new Date(ahora.getTime() + DIAS_EXPIRACION * 24 * 60 * 60 * 1000);
    return new RefreshToken(props.id, props.usuarioId, props.tokenHash, expiraEn, false, ahora);
  }

  revocar(): void {
    if (this._revocado) {
      throw new DomainError('El token ya fue revocado', 'REFRESH_TOKEN_YA_REVOCADO');
    }
    this._revocado = true;
  }

  get estaVigente(): boolean {
    return !this._revocado && new Date() < this._expiraEn;
  }

  get id(): string { return this._id; }
  get usuarioId(): string { return this._usuarioId; }
  get tokenHash(): string { return this._tokenHash; }
  get expiraEn(): Date { return this._expiraEn; }
  get revocado(): boolean { return this._revocado; }
  get creadoEn(): Date { return this._creadoEn; }
}
