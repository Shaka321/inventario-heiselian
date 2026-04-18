import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import type {
  ICategoriaRepository,
  ICategoria,
} from '../repositories/categoria.repository.interface';

@Injectable()
export class PrismaCategoriaRepository implements ICategoriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ICategoria | null> {
    return this.prisma.categoria.findUnique({
      where: { id },
    }) as Promise<ICategoria | null>;
  }

  async findByNombre(nombre: string): Promise<ICategoria | null> {
    return this.prisma.categoria.findUnique({
      where: { nombre },
    }) as Promise<ICategoria | null>;
  }

  async save(categoria: ICategoria): Promise<void> {
    await this.prisma.categoria.create({ data: categoria });
  }

  async update(
    id: string,
    data: { nombre?: string; activo?: boolean },
  ): Promise<void> {
    await this.prisma.categoria.update({ where: { id }, data });
  }

  async findAll(soloActivas = true): Promise<ICategoria[]> {
    return this.prisma.categoria.findMany({
      where: soloActivas ? { activo: true } : undefined,
      orderBy: { nombre: 'asc' },
    }) as Promise<ICategoria[]>;
  }
}
