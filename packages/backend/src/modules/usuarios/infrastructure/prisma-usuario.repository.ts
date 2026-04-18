import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import type { IUsuarioRepository } from '../repositories/usuario.repository.interface';
import { Usuario } from '../../../domain/entities/usuario.entity';
import type { Usuario as PrismaUsuario } from '@prisma/client';

@Injectable()
export class PrismaUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapRow(row: PrismaUsuario): Usuario {
    return Usuario.crear({
      id: row.id,
      email: row.email,
      rol: row.rol,
      passwordHash: row.passwordHash,
    });
  }

  async findById(id: string): Promise<Usuario | null> {
    const row: PrismaUsuario | null = await this.prisma.usuario.findUnique({
      where: { id },
    });
    if (!row) return null;
    return this.mapRow(row);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const row: PrismaUsuario | null = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (!row) return null;
    return this.mapRow(row);
  }

  async save(usuario: Usuario, passwordHash: string): Promise<void> {
    await this.prisma.usuario.create({
      data: {
        id: usuario.id,
        email: usuario.email.valor,
        rol: usuario.rol.valor,
        passwordHash,
        activo: usuario.activo,
        creadoEn: usuario.creadoEn,
      },
    });
  }

  async update(
    id: string,
    data: { rol?: string; activo?: boolean },
  ): Promise<void> {
    await this.prisma.usuario.update({
      where: { id },
      data: {
        ...(data.rol !== undefined && {
          rol: data.rol as 'DUENO' | 'SUPERVISOR' | 'EMPLEADO',
        }),
        ...(data.activo !== undefined && { activo: data.activo }),
      },
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async findAll(): Promise<Usuario[]> {
    const rows: PrismaUsuario[] = await this.prisma.usuario.findMany();
    return rows.map((row) => this.mapRow(row));
  }
}
