import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

export interface ListSalesFilters {
  usuarioId?: string;
  estado?: string;
  desde?: Date;
  hasta?: Date;
}

interface VentaRow {
  id: string;
  usuarioId: string;
  total: { toString(): string } | number;
  metodoPago: string;
  estado: string;
  creadoEn: Date;
  items: Array<{
    varianteId: string;
    cantidad: number;
    precioSnapshot: { toString(): string } | number;
  }>;
}

@Injectable()
export class ListSalesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filters: ListSalesFilters = {}) {
    const whereClause: Record<string, unknown> = {};
    if (filters.usuarioId !== undefined)
      whereClause.usuarioId = filters.usuarioId;
    if (filters.estado !== undefined) whereClause.estado = filters.estado;
    if (filters.desde !== undefined || filters.hasta !== undefined) {
      const creadoEn: Record<string, Date> = {};
      if (filters.desde !== undefined) creadoEn.gte = filters.desde;
      if (filters.hasta !== undefined) creadoEn.lte = filters.hasta;
      whereClause.creadoEn = creadoEn;
    }

    const ventas = (await this.prisma.venta.findMany({
      where: whereClause,
      include: { items: true },
      orderBy: { creadoEn: 'desc' },
    })) as unknown as VentaRow[];

    return ventas.map((v: VentaRow) => ({
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
