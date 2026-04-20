/* eslint-disable @typescript-eslint/unbound-method */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
  IAuditoriaRepository,
  AuditLogEntry,
} from '../repositories/auditoria.repository.interface';

@Injectable()
export class PrismaAuditoriaRepository implements IAuditoriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapear(r: any): AuditLogEntry {
    return {
      id: r.id,
      entidad: r.entidad,
      entidadId: r.entidadId,
      accion: r.accion,
      usuarioId: r.usuarioId,
      payload: r.payload ?? {},
      checksum: r.checksum,
      creadoEn: r.creadoEn,
    };
  }

  async listar(filtros: {
    entidad?: string;
    accion?: string;
    usuarioId?: string;
    desde?: Date;
    hasta?: Date;
    page: number;
    limit: number;
  }): Promise<{ data: AuditLogEntry[]; total: number }> {
    const where: any = {};
    if (filtros.entidad) where.entidad = filtros.entidad;
    if (filtros.accion) where.accion = filtros.accion;
    if (filtros.usuarioId) where.usuarioId = filtros.usuarioId;
    if (filtros.desde || filtros.hasta) {
      where.creadoEn = {};
      if (filtros.desde) where.creadoEn.gte = filtros.desde;
      if (filtros.hasta) where.creadoEn.lte = filtros.hasta;
    }

    const skip = (filtros.page - 1) * filtros.limit;
    const [registros, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: filtros.limit,
        orderBy: { creadoEn: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data: registros.map(this.mapear), total };
  }

  async findById(id: string): Promise<AuditLogEntry | null> {
    const r = await this.prisma.auditLog.findUnique({ where: { id } });
    return r ? this.mapear(r) : null;
  }

  async exportarCSV(filtros: {
    entidad?: string;
    accion?: string;
    usuarioId?: string;
    desde?: Date;
    hasta?: Date;
  }): Promise<AuditLogEntry[]> {
    const where: any = {};
    if (filtros.entidad) where.entidad = filtros.entidad;
    if (filtros.accion) where.accion = filtros.accion;
    if (filtros.usuarioId) where.usuarioId = filtros.usuarioId;
    if (filtros.desde || filtros.hasta) {
      where.creadoEn = {};
      if (filtros.desde) where.creadoEn.gte = filtros.desde;
      if (filtros.hasta) where.creadoEn.lte = filtros.hasta;
    }

    const registros = await this.prisma.auditLog.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
    });

    return registros.map(this.mapear);
  }

  async findAll(): Promise<AuditLogEntry[]> {
    const registros = await this.prisma.auditLog.findMany({
      orderBy: { creadoEn: 'asc' },
    });
    return registros.map(this.mapear);
  }
}


