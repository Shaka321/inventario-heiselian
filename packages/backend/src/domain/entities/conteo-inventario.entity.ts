import { DomainError } from '../errors/domain.error';
import { RolValor } from '../value-objects/rol.vo';

export class ConteoInventario {
  private constructor(
    private readonly _id: string,
    private readonly _usuarioId: string,
    private readonly _rolUsuario: RolValor,
    private readonly _diferenciasJson: Record<string, number>,
    private readonly _creadoEn: Date,
  ) {}

  static crear(props: {
    id: string;
    usuarioId: string;
    rolUsuario: RolValor;
    diferenciasJson: Record<string, number>;
  }): ConteoInventario {
    if (!props.id || props.id.trim().length === 0) {
      throw new DomainError('El ID no puede estar vacio', 'CONTEO_ID_VACIO');
    }
    if (!props.usuarioId || props.usuarioId.trim().length === 0) {
      throw new DomainError(
        'El UsuarioId no puede estar vacio',
        'CONTEO_USUARIO_VACIO',
      );
    }
    if (props.rolUsuario !== RolValor.DUENO) {
      throw new DomainError(
        'Solo el dueno puede iniciar un conteo de inventario',
        'CONTEO_ROL_INSUFICIENTE',
      );
    }
    if (!props.diferenciasJson || typeof props.diferenciasJson !== 'object') {
      throw new DomainError(
        'Las diferencias deben ser un objeto JSON valido',
        'CONTEO_DIFERENCIAS_INVALIDAS',
      );
    }
    return new ConteoInventario(
      props.id,
      props.usuarioId,
      props.rolUsuario,
      { ...props.diferenciasJson },
      new Date(),
    );
  }

  get id(): string {
    return this._id;
  }
  get usuarioId(): string {
    return this._usuarioId;
  }
  get rolUsuario(): RolValor {
    return this._rolUsuario;
  }
  get diferenciasJson(): Record<string, number> {
    return { ...this._diferenciasJson };
  }
  get creadoEn(): Date {
    return this._creadoEn;
  }
}
