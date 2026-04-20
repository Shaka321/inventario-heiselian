/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
  IReportesRepository,
  SalesByPeriodResult,
  TopSellingVariant,
  IncomeVsExpenseResult,
  NetProfitResult,
  CriticalStockItem,
} from '../repositories/reportes.repository.interface';

@Injectable()
export class PrismaReportesRepository implements IReportesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async salesByPeriod(params: {
    desde: Date;
    hasta: Date;
    agruparPor: 'dia' | 'semana' | 'mes';
  }): Promise<SalesByPeriodResult[]> {
    const ventas = await this.prisma.venta.findMany({
      where: {
        creadoEn: { gte: params.desde, lte: params.hasta },
        estado: 'COMPLETADA',
      },
      select: { total: true, creadoEn: true },
      orderBy: { creadoEn: 'asc' },
    });

    const grupos = new Map<string, { total: number; cantidad: number }>();

    for (const venta of ventas) {
      const key = this.formatearPeriodo(venta.creadoEn, params.agruparPor);
      const existing = grupos.get(key) ?? { total: 0, cantidad: 0 };
      grupos.set(key, {
        total: existing.total + Number(venta.total),
        cantidad: existing.cantidad + 1,
      });
    }

    return Array.from(grupos.entries()).map(([periodo, data]) => ({
      periodo,
      totalVentas: data.total,
      cantidadTransacciones: data.cantidad,
      ticketPromedio: data.cantidad > 0 ? data.total / data.cantidad : 0,
    }));
  }

  private formatearPeriodo(
    fecha: Date,
    agruparPor: 'dia' | 'semana' | 'mes',
  ): string {
    if (agruparPor === 'mes') {
      return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    }
    if (agruparPor === 'semana') {
      const inicio = new Date(fecha);
      inicio.setDate(fecha.getDate() - fecha.getDay());
      return inicio.toISOString().split('T')[0];
    }
    return fecha.toISOString().split('T')[0];
  }

  async topSellingVariants(params: {
    desde: Date;
    hasta: Date;
    limit: number;
  }): Promise<TopSellingVariant[]> {
    const items = await this.prisma.ventaItem.groupBy({
      by: ['varianteId'],
      where: {
        venta: {
          creadoEn: { gte: params.desde, lte: params.hasta },
          estado: 'COMPLETADA',
        },
      },
      _sum: { cantidad: true, subtotal: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: params.limit,
    });

    const varianteIds = items.map((i: any) => i.varianteId);
    const variantes = await this.prisma.variante.findMany({
      where: { id: { in: varianteIds } },
      include: { producto: { select: { nombre: true } } },
    });

    const varianteMap = new Map(variantes.map((v: any) => [v.id, v]));

    return items.map((item: any) => {
      const variante = varianteMap.get(item.varianteId);
      return {
        varianteId: item.varianteId,
        nombreProducto: variante?.producto?.nombre ?? 'Desconocido',
        sku: variante?.sku ?? '',
        cantidadVendida: item._sum.cantidad ?? 0,
        totalGenerado: Number(item._sum.subtotal ?? 0),
      };
    });
  }

  async incomeVsExpense(params: {
    desde: Date;
    hasta: Date;
  }): Promise<IncomeVsExpenseResult> {
    const [ventasAgg, comprasAgg, devolucionesAgg] =
      await this.prisma.$transaction([
        this.prisma.venta.aggregate({
          where: {
            creadoEn: { gte: params.desde, lte: params.hasta },
            estado: 'COMPLETADA',
          },
          _sum: { total: true },
        }),
        this.prisma.compra.aggregate({
          where: { creadoEn: { gte: params.desde, lte: params.hasta } },
          _sum: { total: true },
        }),
        this.prisma.devolucion.aggregate({
          where: {
            creadoEn: { gte: params.desde, lte: params.hasta },
            estado: 'APROBADA',
          },
          _sum: { totalDevuelto: true },
        }),
      ]);

    const totalIngresos = Number(ventasAgg._sum.total ?? 0);
    const totalEgresos =
      Number(comprasAgg._sum.total ?? 0) +
      Number(devolucionesAgg._sum.totalDevuelto ?? 0);

    return {
      totalIngresos,
      totalEgresos,
      balance: totalIngresos - totalEgresos,
    };
  }

  async netProfit(params: {
    desde: Date;
    hasta: Date;
  }): Promise<NetProfitResult> {
    const [ventasAgg, comprasAgg, devolucionesAgg] =
      await this.prisma.$transaction([
        this.prisma.venta.aggregate({
          where: {
            creadoEn: { gte: params.desde, lte: params.hasta },
            estado: 'COMPLETADA',
          },
          _sum: { total: true },
        }),
        this.prisma.compra.aggregate({
          where: { creadoEn: { gte: params.desde, lte: params.hasta } },
          _sum: { total: true },
        }),
        this.prisma.devolucion.aggregate({
          where: {
            creadoEn: { gte: params.desde, lte: params.hasta },
            estado: 'APROBADA',
          },
          _sum: { totalDevuelto: true },
        }),
      ]);

    const totalIngresos = Number(ventasAgg._sum.total ?? 0);
    const totalCostos = Number(comprasAgg._sum.total ?? 0);
    const totalDevoluciones = Number(devolucionesAgg._sum.totalDevuelto ?? 0);
    const utilidadBruta = totalIngresos - totalCostos - totalDevoluciones;
    const margenPorcentaje =
      totalIngresos > 0 ? (utilidadBruta / totalIngresos) * 100 : 0;

    return {
      totalIngresos,
      totalCostos,
      totalDevoluciones,
      utilidadBruta,
      margenPorcentaje,
    };
  }

  async criticalStock(umbralMinimo: number): Promise<CriticalStockItem[]> {
    const variantes = await this.prisma.variante.findMany({
      where: { activo: true, stock: { lte: umbralMinimo } },
      include: { producto: { select: { nombre: true } } },
      orderBy: { stock: 'asc' },
    });

    return variantes.map((v: any) => ({
      varianteId: v.id,
      nombreProducto: v.producto?.nombre ?? 'Desconocido',
      sku: v.sku,
      stockActual: v.stock,
      stockMinimo: umbralMinimo,
      deficit: umbralMinimo - v.stock,
    }));
  }
}
