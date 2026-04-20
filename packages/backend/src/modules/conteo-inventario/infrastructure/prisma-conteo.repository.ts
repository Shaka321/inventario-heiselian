/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
  IConteoRepository,
  ConteoInventario,
  ConteoItem,
  EstadoConteo,
} from '../repositories/conteo.repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PrismaConteoRepository implements IConteoRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapear(r: any): ConteoInventario {
    return {
      id: r.id,
      iniciadoPorId: r.iniciadoPorId,
      empleadoId: r.empleadoId ?? undefined,
      estado: r.estado as EstadoConteo,
      items: r.items ?? [],
      notas: r.notas ?? undefined,
      creadoEn: r.creadoEn,
      actualizadoEn: r.actualizadoEn,
    };
  }

  async iniciar(data: {
    iniciadoPorId: string;
    varianteIds: string[];
    notas?: string;
  }): Promise<ConteoInventario> {
    const items: ConteoItem[] = data.varianteIds.map((varianteId) => ({
      varianteId,
      cantidadContada: 0,
    }));

    const r = await this.prisma.conteoInventario.create({
      data: {
        id: uuidv4(),
        iniciadoPorId: data.iniciadoPorId,
        estado: 'EN_PROGRESO',
        items,
        notas: data.notas,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      },
    });

    return this.mapear(r);
  }

  async findById(id: string): Promise<ConteoInventario | null> {
    const r = await this.prisma.conteoInventario.findUnique({ where: { id } });
    return r ? this.mapear(r) : null;
  }

  async findActivo(): Promise<ConteoInventario | null> {
    const r = await this.prisma.conteoInventario.findFirst({
      where: { estado: { in: ['EN_PROGRESO', 'ENVIADO', 'COMPARADO'] } },
    });
    return r ? this.mapear(r) : null;
  }

  async submitConteo(data: {
    id: string;
    empleadoId: string;
    items: { varianteId: string; cantidadContada: number }[];
  }): Promise<ConteoInventario> {
    const r = await this.prisma.conteoInventario.update({
      where: { id: data.id },
      data: {
        empleadoId: data.empleadoId,
        estado: 'ENVIADO',
        items: data.items.map((i) => ({
          varianteId: i.varianteId,
          cantidadContada: i.cantidadContada,
        })),
        actualizadoEn: new Date(),
      },
    });
    return this.mapear(r);
  }

  async getStockSistema(
    varianteIds: string[],
  ): Promise<Record<string, number>> {
    const variantes = await this.prisma.variante.findMany({
      where: { id: { in: varianteIds } },
      select: { id: true, stock: true },
    });
    return Object.fromEntries(variantes.map((v: any) => [v.id, v.stock]));
  }

  async compararConSistema(id: string): Promise<{
    conteo: ConteoInventario;
    discrepancias: {
      varianteId: string;
      cantidadContada: number;
      cantidadSistema: number;
      diferencia: number;
    }[];
    hayDiscrepancias: boolean;
  }> {
    const conteo = await this.findById(id);
    const _varianteIds = conteo!.items.map((i) => i.varianteId);

    const discrepancias = conteo!.items
      .map((item) => {
        const cantidadSistema = stockSistema[item.varianteId] ?? 0;
        const diferencia = item.cantidadContada - cantidadSistema;
        return {
          varianteId: item.varianteId,
          cantidadContada: item.cantidadContada,
          cantidadSistema,
          diferencia,
        };
      })
      .filter((d) => d.diferencia !== 0);

    await this.prisma.conteoInventario.update({
      where: { id },
      data: { estado: 'COMPARADO', actualizadoEn: new Date() },
    });

    return {
      conteo: conteo!,
      discrepancias,
      hayDiscrepancias: discrepancias.length > 0,
    };
  }

  async resolver(
    id: string,
    aplicarAjuste: boolean,
  ): Promise<ConteoInventario> {
    if (aplicarAjuste) {
      const conteo = await this.findById(id);
      const _varianteIds = conteo!.items.map((i) => i.varianteId);

      await this.prisma.$transaction(
        conteo!.items.map((item) =>
          this.prisma.variante.update({
            where: { id: item.varianteId },
            data: { stock: item.cantidadContada },
          }),
        ),
      );
    }

    const r = await this.prisma.conteoInventario.update({
      where: { id },
      data: { estado: 'RESUELTO', actualizadoEn: new Date() },
    });

    return this.mapear(r);
  }
}
