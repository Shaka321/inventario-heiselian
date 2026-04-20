import { Injectable, Inject } from '@nestjs/common';
import { I_AUDITORIA_REPOSITORY } from '../repositories/auditoria.repository.interface';
import type { IAuditoriaRepository, AuditLogEntry } from '../repositories/auditoria.repository.interface';
import { ExportAuditLogDto } from '../dtos';

@Injectable()
export class ExportAuditLogUseCase {
  constructor(
    @Inject(I_AUDITORIA_REPOSITORY)
    private readonly auditoriaRepo: IAuditoriaRepository,
  ) {}

  async execute(filtros: ExportAuditLogDto): Promise<string> {
    const registros = await this.auditoriaRepo.exportarCSV({
      entidad: filtros.entidad,
      accion: filtros.accion,
      usuarioId: filtros.usuarioId,
      desde: filtros.desde ? new Date(filtros.desde) : undefined,
      hasta: filtros.hasta ? new Date(filtros.hasta) : undefined,
    });

    return this.convertirACSV(registros);
  }

  private convertirACSV(registros: AuditLogEntry[]): string {
    const headers = [
      'id',
      'entidad',
      'entidadId',
      'accion',
      'usuarioId',
      'checksum',
      'creadoEn',
    ];
    const escapar = (val: any): string => {
      const str = String(val ?? '');
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const filas = registros.map((r) =>
      headers.map((h) => escapar(r[h as keyof AuditLogEntry])).join(','),
    );

    return [headers.join(','), ...filas].join('\n');
  }
}



