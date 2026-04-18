import { CreateCategoriaUseCase } from '../use-cases/create-categoria.use-case';
import { UpdateCategoriaUseCase } from '../use-cases/update-categoria.use-case';
import { ConflictException, NotFoundException } from '@nestjs/common';
import type { ICategoriaRepository } from '../repositories/categoria.repository.interface';

const mockRepo: jest.Mocked<ICategoriaRepository> = {
  findById: jest.fn(),
  findByNombre: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
};

describe('CreateCategoriaUseCase', () => {
  let useCase: CreateCategoriaUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateCategoriaUseCase(mockRepo);
  });

  it('debe crear una categoria nueva', async () => {
    mockRepo.findByNombre.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue(undefined);

    const result = await useCase.execute({ nombre: 'Bebidas' });
    expect(result.id).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar ConflictException si el nombre ya existe', async () => {
    mockRepo.findByNombre.mockResolvedValue({
      id: 'uuid-1',
      nombre: 'Bebidas',
      activo: true,
      creadoEn: new Date(),
    });
    await expect(useCase.execute({ nombre: 'Bebidas' })).rejects.toThrow(
      ConflictException,
    );
  });
});

describe('UpdateCategoriaUseCase', () => {
  let useCase: UpdateCategoriaUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateCategoriaUseCase(mockRepo);
  });

  it('debe actualizar una categoria existente', async () => {
    mockRepo.findById.mockResolvedValue({
      id: 'uuid-1',
      nombre: 'Bebidas',
      activo: true,
      creadoEn: new Date(),
    });
    mockRepo.findByNombre.mockResolvedValue(null);
    mockRepo.update.mockResolvedValue(undefined);

    await useCase.execute('uuid-1', { nombre: 'Bebidas Frias' });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRepo.update).toHaveBeenCalledWith('uuid-1', {
      nombre: 'Bebidas Frias',
    });
  });

  it('debe lanzar NotFoundException si la categoria no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute('uuid-x', { nombre: 'Nueva' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('debe lanzar ConflictException si el nombre nuevo ya esta en uso', async () => {
    mockRepo.findById.mockResolvedValue({
      id: 'uuid-1',
      nombre: 'Bebidas',
      activo: true,
      creadoEn: new Date(),
    });
    mockRepo.findByNombre.mockResolvedValue({
      id: 'uuid-2',
      nombre: 'Lacteos',
      activo: true,
      creadoEn: new Date(),
    });
    await expect(
      useCase.execute('uuid-1', { nombre: 'Lacteos' }),
    ).rejects.toThrow(ConflictException);
  });
});
