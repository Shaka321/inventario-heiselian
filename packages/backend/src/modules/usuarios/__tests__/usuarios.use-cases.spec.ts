import { CreateUsuarioUseCase } from '../use-cases/create-usuario.use-case';
import { DeactivateUsuarioUseCase } from '../use-cases/deactivate-usuario.use-case';
import { ChangePasswordUseCase } from '../use-cases/change-password.use-case';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Usuario } from '../../../domain/entities/usuario.entity';
import type { IUsuarioRepository } from '../repositories/usuario.repository.interface';
import * as bcrypt from 'bcryptjs';

const mockRepo: jest.Mocked<IUsuarioRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  updatePassword: jest.fn(),
  findAll: jest.fn(),
};

const makeUsuario = (overrides: { activo?: boolean } = {}) => {
  const u = Usuario.crear({
    id: 'uuid-1',
    email: 'test@test.com',
    rol: 'EMPLEADO',
    passwordHash: 'hash',
  });
  if (overrides.activo === false) u.desactivar();
  return u;
};

describe('CreateUsuarioUseCase', () => {
  let useCase: CreateUsuarioUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateUsuarioUseCase(mockRepo);
  });

  it('debe crear un usuario nuevo', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue(undefined);

    const result = await useCase.execute({
      email: 'nuevo@test.com',
      password: 'password123',
      rol: 'EMPLEADO',
    });

    expect(result.id).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar ConflictException si el email ya existe', async () => {
    mockRepo.findByEmail.mockResolvedValue(makeUsuario());
    await expect(
      useCase.execute({
        email: 'test@test.com',
        password: 'password123',
        rol: 'EMPLEADO',
      }),
    ).rejects.toThrow(ConflictException);
  });
});

describe('DeactivateUsuarioUseCase', () => {
  let useCase: DeactivateUsuarioUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeactivateUsuarioUseCase(mockRepo);
  });

  it('debe desactivar un usuario activo', async () => {
    mockRepo.findById.mockResolvedValue(makeUsuario());
    mockRepo.update.mockResolvedValue(undefined);

    await useCase.execute('uuid-1', 'uuid-solicitante');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.update).toHaveBeenCalledWith('uuid-1', { activo: false });
  });

  it('debe lanzar BadRequestException si se desactiva a si mismo', async () => {
    await expect(useCase.execute('uuid-1', 'uuid-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('debe lanzar NotFoundException si el usuario no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('uuid-1', 'uuid-otro')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('debe lanzar BadRequestException si el usuario ya esta inactivo', async () => {
    mockRepo.findById.mockResolvedValue(makeUsuario({ activo: false }));
    await expect(useCase.execute('uuid-1', 'uuid-otro')).rejects.toThrow(
      BadRequestException,
    );
  });
});

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ChangePasswordUseCase(mockRepo);
  });

  it('debe cambiar el password si el actual es correcto', async () => {
    const hash = await bcrypt.hash('password123', 10);
    const usuario = Usuario.crear({
      id: 'uuid-1',
      email: 'test@test.com',
      rol: 'EMPLEADO',
      passwordHash: hash,
    });
    mockRepo.findById.mockResolvedValue(usuario);
    mockRepo.updatePassword.mockResolvedValue(undefined);

    await useCase.execute('uuid-1', {
      passwordActual: 'password123',
      passwordNuevo: 'nuevo456',
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.updatePassword).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar UnauthorizedException si el password actual es incorrecto', async () => {
    const hash = await bcrypt.hash('password123', 10);
    const usuario = Usuario.crear({
      id: 'uuid-1',
      email: 'test@test.com',
      rol: 'EMPLEADO',
      passwordHash: hash,
    });
    mockRepo.findById.mockResolvedValue(usuario);

    await expect(
      useCase.execute('uuid-1', {
        passwordActual: 'wrong',
        passwordNuevo: 'nuevo456',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
