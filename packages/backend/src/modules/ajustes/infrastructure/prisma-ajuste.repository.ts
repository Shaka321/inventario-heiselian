/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import type {
  IAjusteRepository,
  AjusteManual,
} from '../repositories/ajuste.repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PrismaAjusteRepository implements IAjusteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStockActual(varianteId: string): Promise<number> {
    const variante = await (this.prisma as any).variante.findUnique({
      where: { id: varianteId },
      select: { stock: true },
    });
    return (variante?.stock as number) ?? 0;
  }

  async actualizarStock(varianteId: string, nuevaCantidad: number): Promise<void> {
    await (this.prisma as any).variante.update({
      where: { id: varianteId },
      data: { stock: nuevaCantidad },
    });
  }

  async registrarAjuste(data: Omit<AjusteManual, 'id' | 'creadoEn'>): Promise<AjusteManual> {
    const ajuste = await (this.prisma as any).conteoInventario.create({
      data: {
        id: uuidv4(),
        usuarioId: data.usuarioId,
        diferenciasJson: {
          varianteId: data.varianteId,
          cantidadAnterior: data.cantidadAnterior,
          cantidadNueva: data.cantidadNueva,
          diferencia: data.diferencia,
          motivo: data.motivo,
          estado: 'AJUSTE_MANUAL',
        },
        creadoEn: new Date(),
      },
    });

    return this.mapear(ajuste);
  }

  async listarAjustes(filtros: {
    varianteId?: string;
    usuarioId?: string;
    desde?: Date;
    hasta?: Date;
    page: number;
    limit: number;
  }): Promise<{ data: AjusteManual[]; total: number }> {
    const where: any = {};
    if (filtros.usuarioId) where.usuarioId = filtros.usuarioId;
    if (filtros.desde || filtros.hasta) {
      where.creadoEn = {};
      if (filtros.desde) where.creadoEn.gte = filtros.desde;
      if (filtros.hasta) where.creadoEn.lte = filtros.hasta;
    }

    const skip = (filtros.page - 1) * filtros.limit;

    const [registros, total] = await (this.prisma as any).$transaction([
      (this.prisma as any).conteoInventario.findMany({
        where,
        skip,
        take: filtros.limit,
        orderBy: { creadoEn: 'desc' },
      }),
      (this.prisma as any).conteoInventario.count({ where }),
    ]);

    const data = (registros as any[])
      .map((r: any) => this.mapear(r))
      .filter((r: AjusteManual) => {
        const diff = r as any;
        return (
          !filtros.varianteId || diff.varianteId === filtros.varianteId
        );
      });

    return { data, total: data.length > 0 ? (total as number) : 0 };
  }

  async findById(id: string): Promise<AjusteManual | null> {
    const r = await (this.prisma as any).conteoInventario.findUnique({
      where: { id },
    });
    return r ? this.mapear(r) : null;
  }

  private mapear(r: any): AjusteManual {
    const diff = r.diferenciasJson as any ?? {};
    return {
      id: r.id as string,
      varianteId: (diff.varianteId ?? '') as string,
      usuarioId: r.usuarioId as string,
      cantidadAnterior: (diff.cantidadAnterior ?? 0) as number,
      cantidadNueva: (diff.cantidadNueva ?? 0) as number,
      diferencia: (diff.diferencia ?? 0) as number,
      motivo: (diff.motivo ?? '') as string,
      creadoEn: r.creadoEn as Date,
    };
  }
}
