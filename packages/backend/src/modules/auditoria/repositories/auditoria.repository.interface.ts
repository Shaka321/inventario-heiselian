export interface AuditLogEntry {
  id: string;
  entidad: string;
  entidadId: string;
  accion: string;
  usuarioId: string;
  payload: Record<string, any>;
  checksum: string;
  creadoEn: Date;
}

export interface IAuditoriaRepository {
  listar(filtros: {
    entidad?: string;
    accion?: string;
    usuarioId?: string;
    desde?: Date;
    hasta?: Date;
    page: number;
    limit: number;
  }): Promise<{ data: AuditLogEntry[]; total: number }>;
  findById(id: string): Promise<AuditLogEntry | null>;
  exportarCSV(filtros: {
    entidad?: string;
    accion?: string;
    usuarioId?: string;
    desde?: Date;
    hasta?: Date;
  }): Promise<AuditLogEntry[]>;
  findAll(): Promise<AuditLogEntry[]>;
}

export const I_AUDITORIA_REPOSITORY = Symbol('IAuditoriaRepository');
