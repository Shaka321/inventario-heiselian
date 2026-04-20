import { Injectable, Inject } from '@nestjs/common';
import { I_AUDITORIA_REPOSITORY } from '../repositories/auditoria.repository.interface';
import type { IAuditoriaRepository, AuditLogEntry } from '../repositories/auditoria.repository.interface';
import { GetAuditLogDto } from '../dtos';

@Injectable()
export class GetAuditLogUseCase {
  constructor(
    @Inject(I_AUDITORIA_REPOSITORY)
    private readonly auditoriaRepo: IAuditoriaRepository,
  ) {}

  async execute(filtros: GetAuditLogDto): Promise<{
    data: AuditLogEntry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 50;

    const { data, total } = await this.auditoriaRepo.listar({
      entidad: filtros.entidad,
      accion: filtros.accion,
      usuarioId: filtros.usuarioId,
      desde: filtros.desde ? new Date(filtros.desde) : undefined,
      hasta: filtros.hasta ? new Date(filtros.hasta) : undefined,
      page,
      limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}



