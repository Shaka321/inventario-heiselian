import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import type {
  IVarianteRepository,
  IVariante,
} from '../repositories/variante.repository.interface';

interface VarianteRow {
  id: string;
  productoId: string;
  sku: string;
  precio: { toString(): string } | number;
  costo: { toString(): string } | number;
  stock: number;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

@Injectable()
export class PrismaVarianteRepository implements IVarianteRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapRow(row: VarianteRow): IVariante {
    return {
      id: row.id,
      productoId: row.productoId,
      sku: row.sku,
      precio: Number(row.precio),
      costo: Number(row.costo),
      stock: row.stock,
      activo: row.activo,
      creadoEn: row.creadoEn,
    };
  }

  async findById(id: string): Promise<IVariante | null> {
    const row = (await this.prisma.variante.findUnique({
      where: { id },
    })) as VarianteRow | null;
    return row ? this.mapRow(row) : null;
  }

  async findBySku(sku: string): Promise<IVariante | null> {
    const row = (await this.prisma.variante.findUnique({
      where: { sku },
    })) as VarianteRow | null;
    return row ? this.mapRow(row) : null;
  }

  async findByProductoId(productoId: string): Promise<IVariante[]> {
    const rows = (await this.prisma.variante.findMany({
      where: { productoId, activo: true },
      orderBy: { sku: 'asc' },
    })) as VarianteRow[];
    return rows.map((r) => this.mapRow(r));
  }

  async save(variante: IVariante): Promise<void> {
    await this.prisma.variante.create({
      data: {
        id: variante.id,
        productoId: variante.productoId,
        sku: variante.sku,
        precio: variante.precio,
        costo: variante.costo,
        stock: variante.stock,
        activo: variante.activo,
        creadoEn: variante.creadoEn,
      },
    });
  }

  async update(
    id: string,
    data: { sku?: string; precio?: number; costo?: number; activo?: boolean },
  ): Promise<void> {
    await this.prisma.variante.update({ where: { id }, data });
  }

  async updateStock(id: string, nuevoStock: number): Promise<void> {
    await this.prisma.variante.update({
      where: { id },
      data: { stock: nuevoStock },
    });
  }

  async findAll(soloActivas = true): Promise<IVariante[]> {
    const rows = (await this.prisma.variante.findMany({
      where: soloActivas ? { activo: true } : undefined,
      orderBy: { sku: 'asc' },
    })) as VarianteRow[];
    return rows.map((r) => this.mapRow(r));
  }
}
