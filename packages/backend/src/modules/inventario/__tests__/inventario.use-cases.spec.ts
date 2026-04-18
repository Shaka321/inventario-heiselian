import { RegisterPurchaseUseCase } from '../use-cases/register-purchase.use-case';
import { AdjustStockUseCase } from '../use-cases/adjust-stock.use-case';
import { GetStockReportUseCase } from '../use-cases/get-stock-report.use-case';
import { NotFoundException } from '@nestjs/common';

const mockInventarioRepo = {
  registrarCompra: jest.fn(),
  incrementarStock: jest.fn(),
  ajustarStock: jest.fn(),
  getStockActual: jest.fn(),
  findComprasByVariante: jest.fn(),
};

const mockVarianteRepo = {
  findById: jest.fn(),
  findBySku: jest.fn(),
  findByProductoId: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  updateStock: jest.fn(),
  findAll: jest.fn(),
};

const varianteActiva = { id: 'var-1', productoId: 'prod-1', sku: 'CC-500', precio: 5.5, costo: 3.0, stock: 100, activo: true, creadoEn: new Date() };

describe('RegisterPurchaseUseCase', () => {
  let useCase: RegisterPurchaseUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterPurchaseUseCase(mockInventarioRepo as any, mockVarianteRepo as any);
  });

  it('debe registrar una compra e incrementar stock', async () => {
    mockVarianteRepo.findById.mockResolvedValue(varianteActiva);
    mockInventarioRepo.registrarCompra.mockResolvedValue(undefined);
    mockInventarioRepo.incrementarStock.mockResolvedValue(undefined);

    const result = await useCase.execute({
      varianteId: 'var-1',
      proveedorId: 'prov-1',
      cantidadUnidades: 50,
      costoUnitario: 3.0,
    });

    expect(result.id).toBeDefined();
    expect(mockInventarioRepo.registrarCompra).toHaveBeenCalledTimes(1);
    expect(mockInventarioRepo.incrementarStock).toHaveBeenCalledWith('var-1', 50);
  });

  it('debe lanzar NotFoundException si la variante no existe', async () => {
    mockVarianteRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ varianteId: 'var-x', proveedorId: 'prov-1', cantidadUnidades: 50, costoUnitario: 3.0 }),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('AdjustStockUseCase', () => {
  let useCase: AdjustStockUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new AdjustStockUseCase(mockInventarioRepo as any, mockVarianteRepo as any);
  });

  it('debe ajustar el stock de una variante', async () => {
    mockVarianteRepo.findById.mockResolvedValue(varianteActiva);
    mockInventarioRepo.ajustarStock.mockResolvedValue(undefined);

    await useCase.execute({ varianteId: 'var-1', nuevoStock: 80, usuarioId: 'user-1' });
    expect(mockInventarioRepo.ajustarStock).toHaveBeenCalledWith('var-1', 80);
  });

  it('debe lanzar NotFoundException si la variante no existe', async () => {
    mockVarianteRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ varianteId: 'var-x', nuevoStock: 80, usuarioId: 'user-1' }),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('GetStockReportUseCase', () => {
  let useCase: GetStockReportUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetStockReportUseCase(mockVarianteRepo as any);
  });

  it('debe retornar reporte de stock con valor de inventario', async () => {
    mockVarianteRepo.findAll.mockResolvedValue([varianteActiva]);

    const result = await useCase.execute();
    expect(result).toHaveLength(1);
    expect(result[0].valorInventario).toBe(300);
    expect(result[0].sku).toBe('CC-500');
  });
});
