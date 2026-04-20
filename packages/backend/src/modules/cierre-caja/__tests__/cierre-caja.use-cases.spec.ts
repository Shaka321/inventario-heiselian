/* eslint-disable @typescript-eslint/unbound-method */
import { OpenCashRegisterUseCase } from '../use-cases/open-cash-register.use-case';
import { CloseCashRegisterUseCase } from '../use-cases/close-cash-register.use-case';
import { GetCashRegisterHistoryUseCase } from '../use-cases/get-cash-register-history.use-case';
import {
  ICierreCajaRepository,
  CierreCaja,
} from '../repositories/cierre-caja.repository.interface';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

const mockCajaAbierta: CierreCaja = {
  id: 'caja-1',
  usuarioId: 'usr-1',
  fechaApertura: new Date('2025-01-15T08:00:00Z'),
  montoInicial: 500,
  totalVentas: 0,
  totalDevoluciones: 0,
  estado: 'ABIERTA',
  creadoEn: new Date('2025-01-15T08:00:00Z'),
};

const mockCajaCerrada: CierreCaja = {
  ...mockCajaAbierta,
  estado: 'CERRADA',
  fechaCierre: new Date('2025-01-15T18:00:00Z'),
  montoFinal: 1200,
  montoEsperado: 1150,
  diferencia: 50,
  totalVentas: 800,
  totalDevoluciones: 150,
};

const mockRepo: jest.Mocked<ICierreCajaRepository> = {
  abrir: jest.fn(),
  cerrar: jest.fn(),
  findAbierta: jest.fn(),
  findById: jest.fn(),
  listar: jest.fn(),
  calcularTotalesDelDia: jest.fn(),
};

// -- OpenCashRegisterUseCase -----------------------------------------------
describe('OpenCashRegisterUseCase', () => {
  let useCase: OpenCashRegisterUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new OpenCashRegisterUseCase(mockRepo);
  });

  it('lanza ForbiddenException si el rol no es DUENO', async () => {
    await expect(
      useCase.execute({
        dto: { montoInicial: 500 },
        usuarioId: 'usr-1',
        usuarioRol: 'EMPLEADO',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('lanza ConflictException si ya hay una caja abierta', async () => {
    mockRepo.findAbierta.mockResolvedValue(mockCajaAbierta);
    await expect(
      useCase.execute({
        dto: { montoInicial: 500 },
        usuarioId: 'usr-1',
        usuarioRol: 'DUENO',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('abre la caja correctamente si no hay ninguna abierta', async () => {
    mockRepo.findAbierta.mockResolvedValue(null);
    mockRepo.abrir.mockResolvedValue(mockCajaAbierta);

    const result = await useCase.execute({
      dto: { montoInicial: 500 },
      usuarioId: 'usr-1',
      usuarioRol: 'DUENO',
    });

    expect(result.estado).toBe('ABIERTA');
    expect(result.montoInicial).toBe(500);
    expect(mockRepo.abrir).toHaveBeenCalledWith(
      expect.objectContaining({ montoInicial: 500, usuarioId: 'usr-1' }),
    );
  });

  it('pasa las notas opcionales al repositorio', async () => {
    mockRepo.findAbierta.mockResolvedValue(null);
    mockRepo.abrir.mockResolvedValue({
      ...mockCajaAbierta,
      notas: 'Apertura con novedad',
    });

    await useCase.execute({
      dto: { montoInicial: 500, notas: 'Apertura con novedad' },
      usuarioId: 'usr-1',
      usuarioRol: 'DUENO',
    });

    expect(mockRepo.abrir).toHaveBeenCalledWith(
      expect.objectContaining({ notas: 'Apertura con novedad' }),
    );
  });
});

// -- CloseCashRegisterUseCase ----------------------------------------------
describe('CloseCashRegisterUseCase', () => {
  let useCase: CloseCashRegisterUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CloseCashRegisterUseCase(mockRepo);
  });

  it('lanza ForbiddenException si el rol no es DUENO', async () => {
    await expect(
      useCase.execute({
        id: 'caja-1',
        dto: { montoFinal: 1200 },
        usuarioId: 'usr-1',
        usuarioRol: 'EMPLEADO',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('lanza NotFoundException si la caja no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({
        id: 'caja-x',
        dto: { montoFinal: 1200 },
        usuarioId: 'usr-1',
        usuarioRol: 'DUENO',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza DomainError si la caja ya esta cerrada', async () => {
    mockRepo.findById.mockResolvedValue(mockCajaCerrada);
    await expect(
      useCase.execute({
        id: 'caja-1',
        dto: { montoFinal: 1200 },
        usuarioId: 'usr-1',
        usuarioRol: 'DUENO',
      }),
    ).rejects.toThrow('cerrada');
  });

  it('cierra la caja correctamente', async () => {
    mockRepo.findById.mockResolvedValue(mockCajaAbierta);
    mockRepo.cerrar.mockResolvedValue(mockCajaCerrada);

    const result = await useCase.execute({
      id: 'caja-1',
      dto: { montoFinal: 1200 },
      usuarioId: 'usr-1',
      usuarioRol: 'DUENO',
    });

    expect(result.estado).toBe('CERRADA');
    expect(result.diferencia).toBe(50);
    expect(mockRepo.cerrar).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'caja-1', montoFinal: 1200 }),
    );
  });
});

// -- GetCashRegisterHistoryUseCase -----------------------------------------
describe('GetCashRegisterHistoryUseCase', () => {
  let useCase: GetCashRegisterHistoryUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetCashRegisterHistoryUseCase(mockRepo);
  });

  it('retorna historial paginado de cajas', async () => {
    mockRepo.listar.mockResolvedValue({ data: [mockCajaCerrada], total: 1 });

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('calcula totalPages correctamente', async () => {
    mockRepo.listar.mockResolvedValue({ data: [], total: 55 });

    const result = await useCase.execute({ page: 1, limit: 20 });

    expect(result.totalPages).toBe(3);
  });

  it('filtra por estado cuando se provee', async () => {
    mockRepo.listar.mockResolvedValue({ data: [], total: 0 });

    await useCase.execute({ estado: 'CERRADA', page: 1, limit: 20 });

    expect(mockRepo.listar).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'CERRADA' }),
    );
  });
});

