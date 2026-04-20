/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
  IDevolucionRepository,
  Devolucion,
  DevolucionItem,
  EstadoDevolucion,
} from '../repositories/devolucion.repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PrismaDevolucionRepository implements IDevolucionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapear(r: any): Devolucion {
    return {
      id: r.id,
      ventaId: r.ventaId,
      usuarioId: r.usuarioId,
      aprobadoPorId: r.aprobadoPorId ?? undefined,
      motivo: r.motivo,
      estado: r.estado as EstadoDevolucion,
      items: r.items ?? [],
      totalDevuelto: r.totalDevuelto,
      creadoEn: r.creadoEn,
      actualizadoEn: r.actualizadoEn,
    };
  }

  async getVentaConItems(ventaId: string) {
    const venta = await (this.prisma as any).venta.findUnique({
      where: { id: ventaId },
      include: { items: true },
    });
    if (!venta) return null;
    return {
      id: venta.id,
      estado: venta.estado,
      items: venta.items.map((i: any) => ({
        varianteId: i.varianteId,
        cantidad: i.cantidad,
        precioUnitario: Number(i.precioUnitario),
      })),
    };
  }

  async crear(data: {
    ventaId: string;
    usuarioId: string;
    motivo: string;
    items: DevolucionItem[];
  }): Promise<Devolucion> {
    const totalDevuelto = data.items.reduce(
      (sum, i) => sum + i.cantidad * i.precioUnitario,
      0,
    );

    const devolucion = await (this.prisma as any).devolucion.create({
      data: {
        id: uuidv4(),
        ventaId: data.ventaId,
        usuarioId: data.usuarioId,
        motivo: data.motivo,
        estado: 'PENDIENTE',
        items: data.items,
        totalDevuelto,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      },
    });

    return this.mapear(devolucion);
  }

  async findById(id: string): Promise<Devolucion | null> {
    const r = await (this.prisma as any).devolucion.findUnique({ where: { id } });
    return r ? this.mapear(r) : null;
  }

  async findByVentaId(ventaId: string): Promise<Devolucion[]> {
    const registros = await (this.prisma as any).devolucion.findMany({
      where: { ventaId },
    });
    return registros.map(this.mapear);
  }

  async aprobar(id: string, aprobadoPorId: string): Promise<Devolucion> {
    const r = await (this.prisma as any).devolucion.update({
      where: { id },
      data: { estado: 'APROBADA', aprobadoPorId, actualizadoEn: new Date() },
    });
    return this.mapear(r);
  }

  async rechazar(id: string, aprobadoPorId: string): Promise<Devolucion> {
    const r = await (this.prisma as any).devolucion.update({
      where: { id },
      data: { estado: 'RECHAZADA', aprobadoPorId, actualizadoEn: new Date() },
    });
    return this.mapear(r);
  }

  async reingresarStock(items: DevolucionItem[]): Promise<void> {
    await (this.prisma as any).$transaction(
      items.map((item) =>
        (this.prisma as any).variante.update({
          where: { id: item.varianteId },
          data: { stock: { increment: item.cantidad } },
        }),
      ),
    );
  }

  async listar(filtros: {
    estado?: EstadoDevolucion;
    usuarioId?: string;
    desde?: Date;
    hasta?: Date;
    page: number;
    limit: number;
  }): Promise<{ data: Devolucion[]; total: number }> {
    const where: any = {};
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.usuarioId) where.usuarioId = filtros.usuarioId;
    if (filtros.desde || filtros.hasta) {
      where.creadoEn = {};
      if (filtros.desde) where.creadoEn.gte = filtros.desde;
      if (filtros.hasta) where.creadoEn.lte = filtros.hasta;
    }

    const skip = (filtros.page - 1) * filtros.limit;
    const [registros, total] = await (this.prisma as any).$transaction([
      (this.prisma as any).devolucion.findMany({
        where,
        skip,
        take: filtros.limit,
        orderBy: { creadoEn: 'desc' },
      }),
      (this.prisma as any).devolucion.count({ where }),
    ]);

    return { data: registros.map(this.mapear), total };
  }
}

