import { Usuario } from '../../../domain/entities/usuario.entity';

export interface IUsuarioRepository {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  save(usuario: Usuario, passwordHash: string): Promise<void>;
  update(id: string, data: { rol?: string; activo?: boolean }): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  findAll(): Promise<Usuario[]>;
}

export const I_USUARIO_REPOSITORY = Symbol('IUsuarioRepository');
