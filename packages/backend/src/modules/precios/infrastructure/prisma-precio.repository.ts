import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import type { IPrecioRepository, IPrecioHistorial } from '../repositories/precio.repository.interface';

@Injectable()
export class PrismaPrecioRepository implements IPrecioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentPrice(varianteId: string): Promise<number> {
    const variante = await this.prisma.variante.findUnique({
      where: { id: varianteId },
      select: { precio: true },
    });
    return Number(variante?.precio ?? 0);
  }

  async updatePrice(varianteId: string, nuevoPrecio: number): Promise<void> {
    await this.prisma.variante.update({
      where: { id: varianteId },
      data: { precio: nuevoPrecio },
    });
  }

  async saveHistorial(historial: IPrecioHistorial): Promise<void> {
    await this.prisma.precioHistorial.create({
      data: {
        id: historial.id,
        varianteId: historial.varianteId,
        usuarioId: historial.usuarioId,
        precioAnterior: historial.precioAnterior,
        precioNuevo: historial.precioNuevo,
        fecha: historial.fecha,
      },
    });
  }

  async getPriceHistory(varianteId: string): Promise<IPrecioHistorial[]> {
    const rows = await this.prisma.precioHistorial.findMany({
      where: { varianteId },
      orderBy: { fecha: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      varianteId: r.varianteId,
      usuarioId: r.usuarioId,
      precioAnterior: Number(r.precioAnterior),
      precioNuevo: Number(r.precioNuevo),
      fecha: r.fecha,
    }));
  }
}
