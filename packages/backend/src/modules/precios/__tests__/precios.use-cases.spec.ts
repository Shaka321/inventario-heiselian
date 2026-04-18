import { UpdatePriceUseCase } from '../use-cases/update-price.use-case';
import { GetPriceHistoryUseCase } from '../use-cases/get-price-history.use-case';
import { NotFoundException } from '@nestjs/common';

const mockPrecioRepo = {
  getCurrentPrice: jest.fn(),
  updatePrice: jest.fn(),
  saveHistorial: jest.fn(),
  getPriceHistory: jest.fn(),
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

describe('UpdatePriceUseCase', () => {
  let useCase: UpdatePriceUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdatePriceUseCase(mockPrecioRepo as any, mockVarianteRepo as any);
  });

  it('debe actualizar el precio y guardar historial', async () => {
    mockVarianteRepo.findById.mockResolvedValue(varianteActiva);
    mockPrecioRepo.getCurrentPrice.mockResolvedValue(5.5);
    mockPrecioRepo.updatePrice.mockResolvedValue(undefined);
    mockPrecioRepo.saveHistorial.mockResolvedValue(undefined);

    await useCase.execute({ varianteId: 'var-1', nuevoPrecio: 6.5 }, 'user-1');

    expect(mockPrecioRepo.updatePrice).toHaveBeenCalledWith('var-1', 6.5);
    expect(mockPrecioRepo.saveHistorial).toHaveBeenCalledTimes(1);
    const historial = mockPrecioRepo.saveHistorial.mock.calls[0][0];
    expect(historial.precioAnterior).toBe(5.5);
    expect(historial.precioNuevo).toBe(6.5);
  });

  it('debe lanzar NotFoundException si la variante no existe', async () => {
    mockVarianteRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ varianteId: 'var-x', nuevoPrecio: 6.5 }, 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('GetPriceHistoryUseCase', () => {
  let useCase: GetPriceHistoryUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetPriceHistoryUseCase(mockPrecioRepo as any, mockVarianteRepo as any);
  });

  it('debe retornar el historial de precios', async () => {
    mockVarianteRepo.findById.mockResolvedValue(varianteActiva);
    mockPrecioRepo.getPriceHistory.mockResolvedValue([
      { id: 'h-1', varianteId: 'var-1', usuarioId: 'user-1', precioAnterior: 5.0, precioNuevo: 5.5, fecha: new Date() },
    ]);

    const result = await useCase.execute('var-1');
    expect(result).toHaveLength(1);
    expect(result[0].precioNuevo).toBe(5.5);
  });

  it('debe lanzar NotFoundException si la variante no existe', async () => {
    mockVarianteRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('var-x')).rejects.toThrow(NotFoundException);
  });
});
