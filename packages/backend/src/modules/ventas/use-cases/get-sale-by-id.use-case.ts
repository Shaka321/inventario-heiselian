import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class GetSaleByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(ventaId: string) {
    const venta = await this.prisma.venta.findUnique({
      where: { id: ventaId },
      include: { items: true },
    });

    if (!venta) {
      throw new NotFoundException('Venta no encontrada');
    }

    return {
      id: venta.id,
      usuarioId: venta.usuarioId,
      total: Number(venta.total),
      metodoPago: venta.metodoPago,
      estado: venta.estado,
      creadoEn: venta.creadoEn,
      items: venta.items.map((i) => ({
        varianteId: i.varianteId,
        cantidad: i.cantidad,
        precioSnapshot: Number(i.precioSnapshot),
      })),
    };
  }
}
