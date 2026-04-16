import { DomainError } from '../errors/domain.error';
import { Email } from '../value-objects/email.vo';
import { Rol, RolValor } from '../value-objects/rol.vo';

export class Usuario {
  private constructor(
    private readonly _id: string,
    private readonly _email: Email,
    private readonly _rol: Rol,
    private readonly _passwordHash: string,
    private _activo: boolean,
    private readonly _creadoEn: Date,
  ) {}

  static crear(props: {
    id: string;
    email: string;
    rol: string;
    passwordHash: string;
  }): Usuario {
    if (!props.id || props.id.trim().length === 0) {
      throw new DomainError('El ID no puede estar vacio', 'USUARIO_ID_VACIO');
    }
    if (!props.passwordHash || props.passwordHash.trim().length === 0) {
      throw new DomainError('El passwordHash no puede estar vacio', 'USUARIO_PASSWORD_VACIO');
    }
    const email = Email.crear(props.email);
    const rol = Rol.crear(props.rol);
    return new Usuario(props.id, email, rol, props.passwordHash, true, new Date());
  }

  desactivar(): void {
    if (!this._activo) {
      throw new DomainError('El usuario ya esta desactivado', 'USUARIO_YA_DESACTIVADO');
    }
    this._activo = false;
  }

  get id(): string { return this._id; }
  get email(): Email { return this._email; }
  get rol(): Rol { return this._rol; }
  get passwordHash(): string { return this._passwordHash; }
  get activo(): boolean { return this._activo; }
  get creadoEn(): Date { return this._creadoEn; }
  get esDueno(): boolean { return this._rol.esDueno(); }
}
