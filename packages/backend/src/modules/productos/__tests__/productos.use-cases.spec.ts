import { CreateProductoUseCase } from '../use-cases/create-producto.use-case';
import { SoftDeleteProductoUseCase } from '../use-cases/soft-delete-producto.use-case';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockProductoRepo = {
  findById: jest.fn(),
  findByNombre: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  findAll: jest.fn(),
};

const mockCategoriaRepo = {
  findById: jest.fn(),
  findByNombre: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
};

const categoriaActiva = { id: 'cat-1', nombre: 'Bebidas', activo: true, creadoEn: new Date() };
const productoActivo = { id: 'prod-1', nombre: 'Coca Cola', categoriaId: 'cat-1', activo: true, creadoEn: new Date() };

describe('CreateProductoUseCase', () => {
  let useCase: CreateProductoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateProductoUseCase(mockProductoRepo as any, mockCategoriaRepo as any);
  });

  it('debe crear un producto nuevo', async () => {
    mockCategoriaRepo.findById.mockResolvedValue(categoriaActiva);
    mockProductoRepo.findByNombre.mockResolvedValue(null);
    mockProductoRepo.save.mockResolvedValue(undefined);

    const result = await useCase.execute({ nombre: 'Coca Cola', categoriaId: 'cat-1' });
    expect(result.id).toBeDefined();
    expect(mockProductoRepo.save).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar NotFoundException si la categoria no existe', async () => {
    mockCategoriaRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ nombre: 'Coca Cola', categoriaId: 'cat-x' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('debe lanzar ConflictException si el producto ya existe en la categoria', async () => {
    mockCategoriaRepo.findById.mockResolvedValue(categoriaActiva);
    mockProductoRepo.findByNombre.mockResolvedValue(productoActivo);
    await expect(
      useCase.execute({ nombre: 'Coca Cola', categoriaId: 'cat-1' }),
    ).rejects.toThrow(ConflictException);
  });
});

describe('SoftDeleteProductoUseCase', () => {
  let useCase: SoftDeleteProductoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new SoftDeleteProductoUseCase(mockProductoRepo as any);
  });

  it('debe desactivar un producto activo', async () => {
    mockProductoRepo.findById.mockResolvedValue(productoActivo);
    mockProductoRepo.softDelete.mockResolvedValue(undefined);

    await useCase.execute('prod-1');
    expect(mockProductoRepo.softDelete).toHaveBeenCalledWith('prod-1');
  });

  it('debe lanzar NotFoundException si el producto no existe', async () => {
    mockProductoRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('prod-x')).rejects.toThrow(NotFoundException);
  });
});
