import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import type { IAuthRepository } from '../repositories/auth.repository.interface';
import { Usuario } from '../../../domain/entities/usuario.entity';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import type {
  Usuario as PrismaUsuario,
  RefreshToken as PrismaRefreshToken,
} from '@prisma/client';

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUsuarioByEmail(email: string): Promise<Usuario | null> {
    const row: PrismaUsuario | null = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (!row) return null;
    return Usuario.crear({
      id: row.id,
      email: row.email,
      rol: row.rol,
      passwordHash: row.passwordHash,
    });
  }

  async findUsuarioById(id: string): Promise<Usuario | null> {
    const row: PrismaUsuario | null = await this.prisma.usuario.findUnique({
      where: { id },
    });
    if (!row) return null;
    return Usuario.crear({
      id: row.id,
      email: row.email,
      rol: row.rol,
      passwordHash: row.passwordHash,
    });
  }

  async saveRefreshToken(token: RefreshToken): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        id: token.id,
        usuarioId: token.usuarioId,
        tokenHash: token.tokenHash,
        expiraEn: token.expiraEn,
        revocado: false,
        creadoEn: token.creadoEn,
      },
    });
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    const row: PrismaRefreshToken | null =
      await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!row) return null;
    return RefreshToken.crear({
      id: row.id,
      usuarioId: row.usuarioId,
      tokenHash: row.tokenHash,
    });
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revocado: true },
    });
  }

  async revokeAllUserTokens(usuarioId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { usuarioId, revocado: false },
      data: { revocado: true },
    });
  }

  async updateLastLogin(): Promise<void> {
    // actualizadoEn se actualiza automaticamente via @updatedAt en Prisma
  }
}
