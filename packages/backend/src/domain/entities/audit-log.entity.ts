import { createHmac } from 'crypto';
import { DomainError } from '../errors/domain.error';

export enum TipoEvento {
  VENTA_CREADA = 'VENTA_CREADA',
  VENTA_ANULADA = 'VENTA_ANULADA',
  STOCK_AJUSTADO = 'STOCK_AJUSTADO',
  PRECIO_ACTUALIZADO = 'PRECIO_ACTUALIZADO',
  USUARIO_CREADO = 'USUARIO_CREADO',
  USUARIO_DESACTIVADO = 'USUARIO_DESACTIVADO',
  COMPRA_REGISTRADA = 'COMPRA_REGISTRADA',
  CIERRE_CAJA = 'CIERRE_CAJA',
  CONTEO_INVENTARIO = 'CONTEO_INVENTARIO',
  DEVOLUCION_REGISTRADA = 'DEVOLUCION_REGISTRADA',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

export class AuditLog {
  private constructor(
    private readonly _id: string,
    private readonly _tipoEvento: TipoEvento,
    private readonly _usuarioId: string,
    private readonly _payload: Record<string, unknown>,
    private readonly _checksum: string,
    private readonly _creadoEn: Date,
  ) {}

  static crear(
    props: {
      id: string;
      tipoEvento: string;
      usuarioId: string;
      payload: Record<string, unknown>;
    },
    secret: string,
  ): AuditLog {
    if (!props.id || props.id.trim().length === 0) {
      throw new DomainError('El ID no puede estar vacio', 'AUDIT_LOG_ID_VACIO');
    }
    if (!props.usuarioId || props.usuarioId.trim().length === 0) {
      throw new DomainError('El UsuarioId no puede estar vacio', 'AUDIT_LOG_USUARIO_VACIO');
    }
    if (!secret || secret.trim().length === 0) {
      throw new DomainError('El secret HMAC no puede estar vacio', 'AUDIT_LOG_SECRET_VACIO');
    }
    const tipoEvento = props.tipoEvento?.toUpperCase();
    if (!Object.values(TipoEvento).includes(tipoEvento as TipoEvento)) {
      throw new DomainError(
        `TipoEvento invalido: ${props.tipoEvento}`,
        'AUDIT_LOG_TIPO_INVALIDO',
      );
    }
    if (!props.payload || typeof props.payload !== 'object') {
      throw new DomainError('El payload debe ser un objeto', 'AUDIT_LOG_PAYLOAD_INVALIDO');
    }
    const creadoEn = new Date();
    const checksum = AuditLog.calcularChecksum(
      { id: props.id, tipoEvento, usuarioId: props.usuarioId, payload: props.payload, creadoEn: creadoEn.toISOString() },
      secret,
    );
    return new AuditLog(props.id, tipoEvento as TipoEvento, props.usuarioId, { ...props.payload }, checksum, creadoEn);
  }

  static calcularChecksum(data: Record<string, unknown>, secret: string): string {
    return createHmac('sha256', secret)
      .update(JSON.stringify(data))
      .digest('hex');
  }

  verificarIntegridad(secret: string): boolean {
    const esperado = AuditLog.calcularChecksum(
      {
        id: this._id,
        tipoEvento: this._tipoEvento,
        usuarioId: this._usuarioId,
        payload: this._payload,
        creadoEn: this._creadoEn.toISOString(),
      },
      secret,
    );
    return esperado === this._checksum;
  }

  get id(): string { return this._id; }
  get tipoEvento(): TipoEvento { return this._tipoEvento; }
  get usuarioId(): string { return this._usuarioId; }
  get payload(): Record<string, unknown> { return { ...this._payload }; }
  get checksum(): string { return this._checksum; }
  get creadoEn(): Date { return this._creadoEn; }
}
