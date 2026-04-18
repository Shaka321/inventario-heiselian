import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import type { IAuthRepository } from '../repositories/auth.repository.interface';
import { Usuario } from '../../../domain/entities/usuario.entity';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';

interface UsuarioRow {
  id: string;
  email: string;
  rol: string;
  passwordHash: string;
  activo: boolean;
  creadoEn: Date;
}

interface RefreshTokenRow {
  id: string;
  usuarioId: string;
  tokenHash: string;
  expiraEn: Date;
  revocado: boolean;
  creadoEn: Date;
}

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUsuarioByEmail(email: string): Promise<Usuario | null> {
    const row = (await this.prisma.usuario.findUnique({
      where: { email },
    })) as UsuarioRow | null;
    if (!row) return null;
    return Usuario.crear({
      id: row.id,
      email: row.email,
      rol: row.rol,
      passwordHash: row.passwordHash,
    });
  }

  async findUsuarioById(id: string): Promise<Usuario | null> {
    const row = (await this.prisma.usuario.findUnique({
      where: { id },
    })) as UsuarioRow | null;
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
    const row = (await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    })) as RefreshTokenRow | null;
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
