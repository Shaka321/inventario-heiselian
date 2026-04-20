/* eslint-disable @typescript-eslint/unbound-method */
import { StartBlindCountUseCase } from '../use-cases/start-blind-count.use-case';
import { SubmitEmployeeCountUseCase } from '../use-cases/submit-employee-count.use-case';
import { CompareAndReportUseCase } from '../use-cases/compare-and-report.use-case';
import { ResolveDiscrepancyUseCase } from '../use-cases/resolve-discrepancy.use-case';
import {
  IConteoRepository,
  ConteoInventario,
} from '../repositories/conteo.repository.interface';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

const mockConteoEnProgreso: ConteoInventario = {
  id: 'conteo-1',
  iniciadoPorId: 'usr-1',
  estado: 'EN_PROGRESO',
  items: [
    { varianteId: 'var-1', cantidadContada: 0 },
    { varianteId: 'var-2', cantidadContada: 0 },
  ],
  creadoEn: new Date(),
  actualizadoEn: new Date(),
};

const mockConteoEnviado: ConteoInventario = {
  ...mockConteoEnProgreso,
  estado: 'ENVIADO',
  empleadoId: 'emp-1',
  items: [
    { varianteId: 'var-1', cantidadContada: 10 },
    { varianteId: 'var-2', cantidadContada: 25 },
  ],
};

const mockRepo: jest.Mocked<IConteoRepository> = {
  iniciar: jest.fn(),
  findById: jest.fn(),
  findActivo: jest.fn(),
  submitConteo: jest.fn(),
  compararConSistema: jest.fn(),
  resolver: jest.fn(),
  getStockSistema: jest.fn(),
};

// -- StartBlindCountUseCase ------------------------------------------------
describe('StartBlindCountUseCase', () => {
  let useCase: StartBlindCountUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new StartBlindCountUseCase(mockRepo);
  });

  it('lanza ForbiddenException si el rol no es DUENO', async () => {
    await expect(
      useCase.execute({
        dto: { varianteIds: ['var-1'] },
        usuarioId: 'usr-1',
        usuarioRol: 'EMPLEADO',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('lanza ConflictException si ya hay un conteo activo', async () => {
    mockRepo.findActivo.mockResolvedValue(mockConteoEnProgreso);
    await expect(
      useCase.execute({
        dto: { varianteIds: ['var-1'] },
        usuarioId: 'usr-1',
        usuarioRol: 'DUENO',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('inicia conteo correctamente cuando no hay conteo activo', async () => {
    mockRepo.findActivo.mockResolvedValue(null);
    mockRepo.iniciar.mockResolvedValue(mockConteoEnProgreso);

    const result = await useCase.execute({
      dto: { varianteIds: ['var-1', 'var-2'] },
      usuarioId: 'usr-1',
      usuarioRol: 'DUENO',
    });

    expect(result.estado).toBe('EN_PROGRESO');
    expect(mockRepo.iniciar).toHaveBeenCalledWith(
      expect.objectContaining({
        varianteIds: ['var-1', 'var-2'],
        iniciadoPorId: 'usr-1',
      }),
    );
  });
});

// -- SubmitEmployeeCountUseCase --------------------------------------------
describe('SubmitEmployeeCountUseCase', () => {
  let useCase: SubmitEmployeeCountUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new SubmitEmployeeCountUseCase(mockRepo);
  });

  it('lanza NotFoundException si el conteo no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({
        conteoId: 'conteo-x',
        dto: { items: [{ varianteId: 'var-1', cantidadContada: 10 }] },
        empleadoId: 'emp-1',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza DomainError si el conteo no est� EN_PROGRESO', async () => {
    mockRepo.findById.mockResolvedValue(mockConteoEnviado);
    await expect(
      useCase.execute({
        conteoId: 'conteo-1',
        dto: { items: [{ varianteId: 'var-1', cantidadContada: 10 }] },
        empleadoId: 'emp-1',
      }),
    ).rejects.toThrow('enviado');
  });

  it('lanza BadRequestException si items est� vac�o', async () => {
    mockRepo.findById.mockResolvedValue(mockConteoEnProgreso);
    await expect(
      useCase.execute({
        conteoId: 'conteo-1',
        dto: { items: [] },
        empleadoId: 'emp-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza DomainError si variante no pertenece al conteo', async () => {
    mockRepo.findById.mockResolvedValue(mockConteoEnProgreso);
    await expect(
      useCase.execute({
        conteoId: 'conteo-1',
        dto: { items: [{ varianteId: 'var-999', cantidadContada: 5 }] },
        empleadoId: 'emp-1',
      }),
    ).rejects.toThrow('no forma parte');
  });

  it('lanza DomainError si cantidad contada es negativa', async () => {
    mockRepo.findById.mockResolvedValue(mockConteoEnProgreso);
    await expect(
      useCase.execute({
        conteoId: 'conteo-1',
        dto: { items: [{ varianteId: 'var-1', cantidadContada: -1 }] },
        empleadoId: 'emp-1',
      }),
    ).rejects.toThrow('negativa');
  });

  it('NO expone stock del sistema al empleado � solo recibe cantidades contadas', async () => {
    mockRepo.findById.mockResolvedValue(mockConteoEnProgreso);
    mockRepo.submitConteo.mockResolvedValue(mockConteoEnviado);

    const result = await useCase.execute({
      conteoId: 'conteo-1',
      dto: { items: [{ varianteId: 'var-1', cantidadContada: 10 }] },
      empleadoId: 'emp-1',
    });

    // El resultado NO debe contener cantidadSistema
    result.items.forEach((item) => {
      expect(item.cantidadSistema).toBeUndefined();
    });
    expect(mockRepo.getStockSistema).not.toHaveBeenCalled();
  });

  it('env�a conteo correctamente', async () => {
    mockRepo.findById.mockResolvedValue(mockConteoEnProgreso);
    mockRepo.submitConteo.mockResolvedValue(mockConteoEnviado);

    const result = await useCase.execute({
      conteoId: 'conteo-1',
      dto: { items: [{ varianteId: 'var-1', cantidadContada: 10 }] },
      empleadoId: 'emp-1',
    });

    expect(result.estado).toBe('ENVIADO');
    expect(mockRepo.submitConteo).toHaveBeenCalledWith(
      expect.objectContaining({ empleadoId: 'emp-1' }),
    );
  });
});

// -- CompareAndReportUseCase -----------------------------------------------
describe('CompareAndReportUseCase', () => {
  let useCase: CompareAndReportUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CompareAndReportUseCase(mockRepo);
  });

  it('lanza ForbiddenException si el rol no es DUENO', async () => {
    await expect(
      useCase.execute({ conteoId: 'conteo-1', usuarioRol: 'EMPLEADO' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('lanza NotFoundException si el conteo no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ conteoId: 'conteo-x', usuarioRol: 'DUENO' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza DomainError si el conteo a�n est� EN_PROGRESO', async () => {
    mockRepo.findById.mockResolvedValue(mockConteoEnProgreso);
    await expect(
      useCase.execute({ conteoId: 'conteo-1', usuarioRol: 'DUENO' }),
    ).rejects.toThrow('enviado');
  });

  it('retorna discrepancias correctamente', async () => {
    mockRepo.findById.mockResolvedValue(mockConteoEnviado);
    mockRepo.compararConSistema.mockResolvedValue({
      conteo: mockConteoEnviado,
      discrepancias: [
        {
          varianteId: 'var-1',
          cantidadContada: 10,
          cantidadSistema: 12,
          diferencia: -2,
        },
      ],
      hayDiscrepancias: true,
    });

    const result = await useCase.execute({
      conteoId: 'conteo-1',
      usuarioRol: 'DUENO',
    });

    expect(result.hayDiscrepancias).toBe(true);
    expect(result.totalDiscrepancias).toBe(1);
    expect(result.discrepancias[0].diferencia).toBe(-2);
  });

  it('retorna sin discrepancias cuando el conteo coincide', async () => {
    mockRepo.findById.mockResolvedValue(mockConteoEnviado);
    mockRepo.compararConSistema.mockResolvedValue({
      conteo: mockConteoEnviado,
      discrepancias: [],
      hayDiscrepancias: false,
    });

    const result = await useCase.execute({
      conteoId: 'conteo-1',
      usuarioRol: 'DUENO',
    });

    expect(result.hayDiscrepancias).toBe(false);
    expect(result.totalDiscrepancias).toBe(0);
  });
});

// -- ResolveDiscrepancyUseCase ---------------------------------------------
describe('ResolveDiscrepancyUseCase', () => {
  let useCase: ResolveDiscrepancyUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ResolveDiscrepancyUseCase(mockRepo);
  });

  it('lanza ForbiddenException si el rol no es DUENO', async () => {
    await expect(
      useCase.execute({
        conteoId: 'conteo-1',
        dto: { aplicarAjuste: true },
        usuarioRol: 'EMPLEADO',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('lanza NotFoundException si el conteo no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({
        conteoId: 'conteo-x',
        dto: { aplicarAjuste: false },
        usuarioRol: 'DUENO',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza DomainError si el conteo est� EN_PROGRESO', async () => {
    mockRepo.findById.mockResolvedValue(mockConteoEnProgreso);
    await expect(
      useCase.execute({
        conteoId: 'conteo-1',
        dto: { aplicarAjuste: true },
        usuarioRol: 'DUENO',
      }),
    ).rejects.toThrow('ENVIADO o COMPARADO');
  });

  it('resuelve con ajuste aplicado', async () => {
    mockRepo.findById.mockResolvedValue(mockConteoEnviado);
    mockRepo.resolver.mockResolvedValue({
      ...mockConteoEnviado,
      estado: 'RESUELTO',
    });

    const result = await useCase.execute({
      conteoId: 'conteo-1',
      dto: { aplicarAjuste: true },
      usuarioRol: 'DUENO',
    });

    expect(result.estado).toBe('RESUELTO');
    expect(mockRepo.resolver).toHaveBeenCalledWith('conteo-1', true);
  });

  it('resuelve sin aplicar ajuste', async () => {
    mockRepo.findById.mockResolvedValue(mockConteoEnviado);
    mockRepo.resolver.mockResolvedValue({
      ...mockConteoEnviado,
      estado: 'RESUELTO',
    });

    await useCase.execute({
      conteoId: 'conteo-1',
      dto: { aplicarAjuste: false },
      usuarioRol: 'DUENO',
    });

    expect(mockRepo.resolver).toHaveBeenCalledWith('conteo-1', false);
  });
});

