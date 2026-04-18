import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import type {
  IInventarioRepository,
  ICompra,
} from '../repositories/inventario.repository.interface';

@Injectable()
export class PrismaInventarioRepository implements IInventarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registrarCompra(compra: ICompra): Promise<void> {
    await this.prisma.compra.create({
      data: {
        id: compra.id,
        varianteId: compra.varianteId,
        proveedorId: compra.proveedorId,
        cantidadUnidades: compra.cantidadUnidades,
        costoUnitario: compra.costoUnitario,
        creadoEn: compra.creadoEn,
      },
    });
  }

  async incrementarStock(varianteId: string, cantidad: number): Promise<void> {
    await this.prisma.variante.update({
      where: { id: varianteId },
      data: { stock: { increment: cantidad } },
    });
  }

  async ajustarStock(varianteId: string, nuevoStock: number): Promise<void> {
    await this.prisma.variante.update({
      where: { id: varianteId },
      data: { stock: nuevoStock },
    });
  }

  async getStockActual(varianteId: string): Promise<number> {
    const variante = await this.prisma.variante.findUnique({
      where: { id: varianteId },
      select: { stock: true },
    });
    return variante?.stock ?? 0;
  }

  async findComprasByVariante(varianteId: string): Promise<ICompra[]> {
    const rows = await this.prisma.compra.findMany({
      where: { varianteId },
      orderBy: { creadoEn: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      varianteId: r.varianteId,
      proveedorId: r.proveedorId,
      cantidadUnidades: r.cantidadUnidades,
      costoUnitario: Number(r.costoUnitario),
      creadoEn: r.creadoEn,
    }));
  }
}
