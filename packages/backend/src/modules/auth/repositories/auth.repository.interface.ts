import { Usuario } from '../../../domain/entities/usuario.entity';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';

export interface IAuthRepository {
  findUsuarioByEmail(email: string): Promise<Usuario | null>;
  findUsuarioById(id: string): Promise<Usuario | null>;
  saveRefreshToken(token: RefreshToken): Promise<void>;
  findRefreshToken(tokenHash: string): Promise<RefreshToken | null>;
  revokeRefreshToken(tokenHash: string): Promise<void>;
  revokeAllUserTokens(usuarioId: string): Promise<void>;
  updateLastLogin(usuarioId: string): Promise<void>;
}

export const I_AUTH_REPOSITORY = Symbol('IAuthRepository');
