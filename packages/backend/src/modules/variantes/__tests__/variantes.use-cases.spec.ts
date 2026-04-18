import { CreateVarianteUseCase } from '../use-cases/create-variante.use-case';
import { UpdateVarianteUseCase } from '../use-cases/update-variante.use-case';
import { GetVarianteStockUseCase } from '../use-cases/get-variante-stock.use-case';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockVarianteRepo = {
  findById: jest.fn(),
  findBySku: jest.fn(),
  findByProductoId: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  updateStock: jest.fn(),
  findAll: jest.fn(),
};

const mockProductoRepo = {
  findById: jest.fn(),
  findByNombre: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  findAll: jest.fn(),
};

const productoActivo = { id: 'prod-1', nombre: 'Coca Cola', categoriaId: 'cat-1', activo: true, creadoEn: new Date() };
const varianteActiva = { id: 'var-1', productoId: 'prod-1', sku: 'CC-500', precio: 5.5, costo: 3.0, stock: 100, activo: true, creadoEn: new Date() };

describe('CreateVarianteUseCase', () => {
  let useCase: CreateVarianteUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateVarianteUseCase(mockVarianteRepo as any, mockProductoRepo as any);
  });

  it('debe crear una variante nueva', async () => {
    mockProductoRepo.findById.mockResolvedValue(productoActivo);
    mockVarianteRepo.findBySku.mockResolvedValue(null);
    mockVarianteRepo.save.mockResolvedValue(undefined);

    const result = await useCase.execute({ productoId: 'prod-1', sku: 'CC-500', precio: 5.5, costo: 3.0, stock: 100 });
    expect(result.id).toBeDefined();
    expect(mockVarianteRepo.save).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar NotFoundException si el producto no existe', async () => {
    mockProductoRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ productoId: 'prod-x', sku: 'CC-500', precio: 5.5, costo: 3.0, stock: 100 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('debe lanzar ConflictException si el SKU ya existe', async () => {
    mockProductoRepo.findById.mockResolvedValue(productoActivo);
    mockVarianteRepo.findBySku.mockResolvedValue(varianteActiva);
    await expect(
      useCase.execute({ productoId: 'prod-1', sku: 'CC-500', precio: 5.5, costo: 3.0, stock: 100 }),
    ).rejects.toThrow(ConflictException);
  });
});

describe('UpdateVarianteUseCase', () => {
  let useCase: UpdateVarianteUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateVarianteUseCase(mockVarianteRepo as any);
  });

  it('debe actualizar una variante existente', async () => {
    mockVarianteRepo.findById.mockResolvedValue(varianteActiva);
    mockVarianteRepo.findBySku.mockResolvedValue(null);
    mockVarianteRepo.update.mockResolvedValue(undefined);

    await useCase.execute('var-1', { precio: 6.0 });
    expect(mockVarianteRepo.update).toHaveBeenCalledWith('var-1', { precio: 6.0 });
  });

  it('debe lanzar NotFoundException si la variante no existe', async () => {
    mockVarianteRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('var-x', { precio: 6.0 })).rejects.toThrow(NotFoundException);
  });
});

describe('GetVarianteStockUseCase', () => {
  let useCase: GetVarianteStockUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetVarianteStockUseCase(mockVarianteRepo as any);
  });

  it('debe retornar el stock de una variante', async () => {
    mockVarianteRepo.findById.mockResolvedValue(varianteActiva);
    const result = await useCase.execute('var-1');
    expect(result.stock).toBe(100);
    expect(result.sku).toBe('CC-500');
  });

  it('debe lanzar NotFoundException si la variante no existe', async () => {
    mockVarianteRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('var-x')).rejects.toThrow(NotFoundException);
  });
});
