import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import type {
  IProductoRepository,
  IProducto,
} from '../repositories/producto.repository.interface';

@Injectable()
export class PrismaProductoRepository implements IProductoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<IProducto | null> {
    return this.prisma.producto.findUnique({
      where: { id },
    }) as Promise<IProducto | null>;
  }

  async findByNombre(
    nombre: string,
    categoriaId: string,
  ): Promise<IProducto | null> {
    return this.prisma.producto.findFirst({
      where: { nombre, categoriaId, activo: true },
    }) as Promise<IProducto | null>;
  }

  async save(producto: IProducto): Promise<void> {
    await this.prisma.producto.create({ data: producto });
  }

  async update(
    id: string,
    data: { nombre?: string; categoriaId?: string },
  ): Promise<void> {
    await this.prisma.producto.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.producto.update({
      where: { id },
      data: { activo: false },
    });
  }

  async findAll(soloActivos = true): Promise<IProducto[]> {
    return this.prisma.producto.findMany({
      where: soloActivos ? { activo: true } : undefined,
      orderBy: { nombre: 'asc' },
    }) as Promise<IProducto[]>;
  }
}
