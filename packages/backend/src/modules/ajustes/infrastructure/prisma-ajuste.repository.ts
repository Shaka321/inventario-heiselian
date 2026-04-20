/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
  IAjusteRepository,
  AjusteManual,
} from '../repositories/ajuste.repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PrismaAjusteRepository implements IAjusteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStockActual(varianteId: string): Promise<number> {
    const variante = await this.prisma.variante.findUnique({
      where: { id: varianteId },
      select: { stock: true },
    });
    return variante?.stock ?? null;
  }

  async actualizarStock(
    varianteId: string,
    nuevaCantidad: number,
  ): Promise<void> {
    await this.prisma.variante.update({
      where: { id: varianteId },
      data: { stock: nuevaCantidad },
    });
  }

  async registrarAjuste(
    data: Omit<AjusteManual, 'id' | 'creadoEn'>,
  ): Promise<AjusteManual> {
    const ajuste = await this.prisma.conteoInventario.create({
      data: {
        id: uuidv4(),
        varianteId: data.varianteId,
        usuarioId: data.usuarioId,
        cantidadSistema: data.cantidadAnterior,
        cantidadContada: data.cantidadNueva,
        diferencia: data.diferencia,
        notas: data.motivo,
        estado: 'AJUSTE_MANUAL',
        creadoEn: new Date(),
      },
    });

    return {
      id: ajuste.id,
      varianteId: ajuste.varianteId,
      usuarioId: ajuste.usuarioId,
      cantidadAnterior: ajuste.cantidadSistema,
      cantidadNueva: ajuste.cantidadContada,
      diferencia: ajuste.diferencia,
      motivo: ajuste.notas ?? '',
      creadoEn: ajuste.creadoEn,
    };
  }

  async listarAjustes(filtros: {
    varianteId?: string;
    usuarioId?: string;
    desde?: Date;
    hasta?: Date;
    page: number;
    limit: number;
  }): Promise<{ data: AjusteManual[]; total: number }> {
    const where: any = { estado: 'AJUSTE_MANUAL' };

    if (filtros.varianteId) where.varianteId = filtros.varianteId;
    if (filtros.usuarioId) where.usuarioId = filtros.usuarioId;
    if (filtros.desde || filtros.hasta) {
      where.creadoEn = {};
      if (filtros.desde) where.creadoEn.gte = filtros.desde;
      if (filtros.hasta) where.creadoEn.lte = filtros.hasta;
    }

    const skip = (filtros.page - 1) * filtros.limit;

    const [registros, total] = await this.prisma.$transaction([
      this.prisma.conteoInventario.findMany({
        where,
        skip,
        take: filtros.limit,
        orderBy: { creadoEn: 'desc' },
      }),
      this.prisma.conteoInventario.count({ where }),
    ]);

    return {
      data: registros.map((r: any) => ({
        id: r.id,
        varianteId: r.varianteId,
        usuarioId: r.usuarioId,
        cantidadAnterior: r.cantidadSistema,
        cantidadNueva: r.cantidadContada,
        diferencia: r.diferencia,
        motivo: r.notas ?? '',
        creadoEn: r.creadoEn,
      })),
      total,
    };
  }

  async findById(id: string): Promise<AjusteManual | null> {
    const r = await this.prisma.conteoInventario.findUnique({ where: { id } });
    if (!r) return null;
    return {
      id: r.id,
      varianteId: r.varianteId,
      usuarioId: r.usuarioId,
      cantidadAnterior: r.cantidadSistema,
      cantidadNueva: r.cantidadContada,
      diferencia: r.diferencia,
      motivo: r.notas ?? '',
      creadoEn: r.creadoEn,
    };
  }
}
