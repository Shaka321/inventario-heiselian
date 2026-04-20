/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
  ICierreCajaRepository,
  CierreCaja,
  EstadoCaja,
} from '../repositories/cierre-caja.repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PrismaCierreCajaRepository implements ICierreCajaRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapear(r: any): CierreCaja {
    return {
      id: r.id,
      usuarioId: r.usuarioId,
      fechaApertura: r.fechaApertura,
      fechaCierre: r.fechaCierre ?? undefined,
      montoInicial: Number(r.montoInicial),
      montoFinal: r.montoFinal != null ? Number(r.montoFinal) : undefined,
      montoEsperado:
        r.montoEsperado != null ? Number(r.montoEsperado) : undefined,
      diferencia: r.diferencia != null ? Number(r.diferencia) : undefined,
      totalVentas: Number(r.totalVentas ?? 0),
      totalDevoluciones: Number(r.totalDevoluciones ?? 0),
      estado: r.estado as EstadoCaja,
      notas: r.notas ?? undefined,
      creadoEn: r.creadoEn,
    };
  }

  async abrir(data: {
    usuarioId: string;
    montoInicial: number;
    notas?: string;
  }): Promise<CierreCaja> {
    const ahora = new Date();
    const r = await this.prisma.cierreCaja.create({
      data: {
        id: uuidv4(),
        usuarioId: data.usuarioId,
        montoInicial: data.montoInicial,
        totalVentas: 0,
        totalDevoluciones: 0,
        estado: 'ABIERTA',
        notas: data.notas,
        fechaApertura: ahora,
        creadoEn: ahora,
      },
    });
    return this.mapear(r);
  }

  async cerrar(data: {
    id: string;
    montoFinal: number;
    notas?: string;
  }): Promise<CierreCaja> {
    const caja = await this.prisma.cierreCaja.findUnique({
      where: { id: data.id },
    });

    const ahora = new Date();
    const { totalVentas, totalDevoluciones, montoEsperado } =
      await this.calcularTotalesDelDia(caja!.fechaApertura, ahora);

    const diferencia = data.montoFinal - montoEsperado;

    const r = await this.prisma.cierreCaja.update({
      where: { id: data.id },
      data: {
        montoFinal: data.montoFinal,
        montoEsperado,
        diferencia,
        totalVentas,
        totalDevoluciones,
        estado: 'CERRADA',
        fechaCierre: ahora,
        notas: data.notas ?? caja!.notas,
      },
    });

    return this.mapear(r);
  }

  async findAbierta(): Promise<CierreCaja | null> {
    const r = await this.prisma.cierreCaja.findFirst({
      where: { estado: 'ABIERTA' },
    });
    return r ? this.mapear(r) : null;
  }

  async findById(id: string): Promise<CierreCaja | null> {
    const r = await this.prisma.cierreCaja.findUnique({ where: { id } });
    return r ? this.mapear(r) : null;
  }

  async listar(filtros: {
    usuarioId?: string;
    estado?: EstadoCaja;
    page: number;
    limit: number;
  }): Promise<{ data: CierreCaja[]; total: number }> {
    const where: any = {};
    if (filtros.usuarioId) where.usuarioId = filtros.usuarioId;
    if (filtros.estado) where.estado = filtros.estado;

    const skip = (filtros.page - 1) * filtros.limit;
    const [registros, total] = await this.prisma.$transaction([
      this.prisma.cierreCaja.findMany({
        where,
        skip,
        take: filtros.limit,
        orderBy: { creadoEn: 'desc' },
      }),
      this.prisma.cierreCaja.count({ where }),
    ]);

    return { data: registros.map((r: any) => this.mapear(r)), total };
  }

  async calcularTotalesDelDia(
    desde: Date,
    hasta: Date,
  ): Promise<{
    totalVentas: number;
    totalDevoluciones: number;
    montoEsperado: number;
  }> {
    const [ventasAgg, devolucionesAgg] = await this.prisma.$transaction([
      this.prisma.venta.aggregate({
        where: { creadoEn: { gte: desde, lte: hasta }, estado: 'COMPLETADA' },
        _sum: { total: true },
      }),
      this.prisma.devolucion.aggregate({
        where: { creadoEn: { gte: desde, lte: hasta }, estado: 'APROBADA' },
        _sum: { totalDevuelto: true },
      }),
    ]);

    const totalVentas = Number(ventasAgg._sum.total ?? 0);
    const totalDevoluciones = Number(devolucionesAgg._sum.totalDevuelto ?? 0);
    const montoEsperado = totalVentas - totalDevoluciones;

    return { totalVentas, totalDevoluciones, montoEsperado };
  }
}
