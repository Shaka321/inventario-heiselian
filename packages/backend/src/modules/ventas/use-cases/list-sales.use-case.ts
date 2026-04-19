import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { EstadoVenta } from '@prisma/client';

export interface ListSalesFilters {
  usuarioId?: string;
  estado?: string;
  desde?: Date;
  hasta?: Date;
}

@Injectable()
export class ListSalesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: ListSalesFilters = {}) {
    const ventas = await this.prisma.venta.findMany({
      where: {
        ...(filters.usuarioId !== undefined && {
          usuarioId: filters.usuarioId,
        }),
        ...(filters.estado !== undefined && {
          estado: filters.estado as EstadoVenta,
        }),
        ...(filters.desde !== undefined || filters.hasta !== undefined
          ? {
              creadoEn: {
                ...(filters.desde !== undefined && { gte: filters.desde }),
                ...(filters.hasta !== undefined && { lte: filters.hasta }),
              },
            }
          : {}),
      },
      include: { items: true },
      orderBy: { creadoEn: 'desc' },
    });

    return ventas.map((v) => ({
      id: v.id,
      usuarioId: v.usuarioId,
      total: Number(v.total),
      metodoPago: v.metodoPago,
      estado: v.estado,
      creadoEn: v.creadoEn,
      items: v.items.map((i) => ({
        varianteId: i.varianteId,
        cantidad: i.cantidad,
        precioSnapshot: Number(i.precioSnapshot),
      })),
    }));
  }
}
