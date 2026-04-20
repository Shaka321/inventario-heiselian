/* eslint-disable @typescript-eslint/unbound-method */
import { RegisterManualAdjustUseCase } from '../use-cases/register-manual-adjust.use-case';
import { ListAdjustmentsUseCase } from '../use-cases/list-adjustments.use-case';
import { IAjusteRepository } from '../repositories/ajuste.repository.interface';
import { ForbiddenException } from '@nestjs/common';

const mockAjuste = {
  id: 'adj-1',
  varianteId: 'var-1',
  usuarioId: 'usr-1',
  cantidadAnterior: 100,
  cantidadNueva: 120,
  diferencia: 20,
  motivo: 'Conteo fisico mensual',
  creadoEn: new Date(),
};

const mockRepo: jest.Mocked<IAjusteRepository> = {
  getStockActual: jest.fn(),
  actualizarStock: jest.fn(),
  registrarAjuste: jest.fn(),
  listarAjustes: jest.fn(),
  findById: jest.fn(),
};

describe('RegisterManualAdjustUseCase', () => {
  let useCase: RegisterManualAdjustUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterManualAdjustUseCase(mockRepo);
  });

  it('lanza ForbiddenException si el rol no es DUENO', async () => {
    await expect(
      useCase.execute({
        dto: {
          varianteId: 'var-1',
          nuevaCantidad: 120,
          motivo: 'Test motivo suficiente',
        },
        usuarioId: 'usr-1',
        usuarioRol: 'EMPLEADO',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('lanza error si la cantidad nueva es negativa', async () => {
    mockRepo.getStockActual.mockResolvedValue(100);
    await expect(
      useCase.execute({
        dto: {
          varianteId: 'var-1',
          nuevaCantidad: -5,
          motivo: 'Test motivo suficiente',
        },
        usuarioId: 'usr-1',
        usuarioRol: 'DUENO',
      }),
    ).rejects.toThrow('cantidad nueva no puede ser negativa');
  });

  it('registra ajuste correctamente y no genera alerta si diferencia < umbral', async () => {
    mockRepo.getStockActual.mockResolvedValue(100);
    mockRepo.actualizarStock.mockResolvedValue(undefined);
    mockRepo.registrarAjuste.mockResolvedValue({
      ...mockAjuste,
      diferencia: 10,
      cantidadNueva: 110,
    });

    const result = await useCase.execute({
      dto: {
        varianteId: 'var-1',
        nuevaCantidad: 110,
        motivo: 'Ajuste menor de prueba',
      },
      usuarioId: 'usr-1',
      usuarioRol: 'DUENO',
    });

    expect(result.alerta).toBe(false);
    expect(result.mensajeAlerta).toBeUndefined();
    expect(mockRepo.actualizarStock).toHaveBeenCalledWith('var-1', 110);
  });

  it('genera alerta si la diferencia supera el umbral de 50 unidades', async () => {
    mockRepo.getStockActual.mockResolvedValue(100);
    mockRepo.actualizarStock.mockResolvedValue(undefined);
    mockRepo.registrarAjuste.mockResolvedValue({
      ...mockAjuste,
      diferencia: 60,
      cantidadNueva: 160,
    });

    const result = await useCase.execute({
      dto: {
        varianteId: 'var-1',
        nuevaCantidad: 160,
        motivo: 'Ajuste grande de inventario',
      },
      usuarioId: 'usr-1',
      usuarioRol: 'DUENO',
    });

    expect(result.alerta).toBe(true);
    expect(result.mensajeAlerta).toContain('umbral');
  });

  it('lanza error si la variante no existe (stock null)', async () => {
    mockRepo.getStockActual.mockResolvedValue(null as unknown as number);

    await expect(
      useCase.execute({
        dto: {
          varianteId: 'var-inexistente',
          nuevaCantidad: 10,
          motivo: 'Motivo valido de prueba',
        },
        usuarioId: 'usr-1',
        usuarioRol: 'DUENO',
      }),
    ).rejects.toThrow();
  });
});

describe('ListAdjustmentsUseCase', () => {
  let useCase: ListAdjustmentsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListAdjustmentsUseCase(mockRepo);
  });

  it('retorna lista paginada de ajustes', async () => {
    mockRepo.listarAjustes.mockResolvedValue({ data: [mockAjuste], total: 1 });

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('calcula totalPages correctamente', async () => {
    mockRepo.listarAjustes.mockResolvedValue({ data: [], total: 45 });

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.totalPages).toBe(3);
  });

  it('filtra por varianteId cuando se provee', async () => {
    mockRepo.listarAjustes.mockResolvedValue({ data: [], total: 0 });

    await useCase.execute({ varianteId: 'var-1', page: 1, limit: 20 });

    expect(mockRepo.listarAjustes).toHaveBeenCalledWith(
      expect.objectContaining({ varianteId: 'var-1' }),
    );
  });
});


