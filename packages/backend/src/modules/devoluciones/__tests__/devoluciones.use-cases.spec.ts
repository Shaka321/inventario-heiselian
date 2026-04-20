/* eslint-disable @typescript-eslint/unbound-method */
import { RegisterReturnUseCase } from '../use-cases/register-return.use-case';
import { ApproveReturnUseCase } from '../use-cases/approve-return.use-case';
import { RejectReturnUseCase } from '../use-cases/reject-return.use-case';
import {
  IDevolucionRepository,
  Devolucion,
} from '../repositories/devolucion.repository.interface';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

const mockDevolucion: Devolucion = {
  id: 'dev-1',
  ventaId: 'venta-1',
  usuarioId: 'usr-1',
  motivo: 'Producto defectuoso confirmado',
  estado: 'PENDIENTE',
  items: [{ varianteId: 'var-1', cantidad: 2, precioUnitario: 50 }],
  totalDevuelto: 100,
  creadoEn: new Date(),
  actualizadoEn: new Date(),
};

const mockVenta = {
  id: 'venta-1',
  estado: 'COMPLETADA',
  items: [{ varianteId: 'var-1', cantidad: 5, precioUnitario: 50 }],
};

const mockRepo: jest.Mocked<IDevolucionRepository> = {
  crear: jest.fn(),
  findById: jest.fn(),
  findByVentaId: jest.fn(),
  aprobar: jest.fn(),
  rechazar: jest.fn(),
  listar: jest.fn(),
  getVentaConItems: jest.fn(),
  reingresarStock: jest.fn(),
};

// -- RegisterReturnUseCase -------------------------------------------------
describe('RegisterReturnUseCase', () => {
  let useCase: RegisterReturnUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterReturnUseCase(mockRepo);
  });

  it('lanza BadRequestException si items est� vac�o', async () => {
    await expect(
      useCase.execute({
        dto: { ventaId: 'venta-1', motivo: 'Motivo valido largo', items: [] },
        usuarioId: 'usr-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('lanza NotFoundException si la venta no existe', async () => {
    mockRepo.getVentaConItems.mockResolvedValue(null);
    await expect(
      useCase.execute({
        dto: {
          ventaId: 'venta-x',
          motivo: 'Motivo valido largo',
          items: [{ varianteId: 'var-1', cantidad: 1 }],
        },
        usuarioId: 'usr-1',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza DomainError si la venta est� cancelada', async () => {
    mockRepo.getVentaConItems.mockResolvedValue({
      ...mockVenta,
      estado: 'CANCELADA',
    });
    await expect(
      useCase.execute({
        dto: {
          ventaId: 'venta-1',
          motivo: 'Motivo valido largo',
          items: [{ varianteId: 'var-1', cantidad: 1 }],
        },
        usuarioId: 'usr-1',
      }),
    ).rejects.toThrow('cancelada');
  });

  it('lanza DomainError si ya existe una devoluci�n aprobada para esa venta', async () => {
    mockRepo.getVentaConItems.mockResolvedValue(mockVenta);
    mockRepo.findByVentaId.mockResolvedValue([
      { ...mockDevolucion, estado: 'APROBADA' },
    ]);
    await expect(
      useCase.execute({
        dto: {
          ventaId: 'venta-1',
          motivo: 'Motivo valido largo',
          items: [{ varianteId: 'var-1', cantidad: 1 }],
        },
        usuarioId: 'usr-1',
      }),
    ).rejects.toThrow('aprobada');
  });

  it('lanza DomainError si la variante no pertenece a la venta', async () => {
    mockRepo.getVentaConItems.mockResolvedValue(mockVenta);
    mockRepo.findByVentaId.mockResolvedValue([]);
    await expect(
      useCase.execute({
        dto: {
          ventaId: 'venta-1',
          motivo: 'Motivo valido largo',
          items: [{ varianteId: 'var-999', cantidad: 1 }],
        },
        usuarioId: 'usr-1',
      }),
    ).rejects.toThrow('no pertenece');
  });

  it('lanza DomainError si cantidad a devolver excede lo vendido', async () => {
    mockRepo.getVentaConItems.mockResolvedValue(mockVenta);
    mockRepo.findByVentaId.mockResolvedValue([]);
    await expect(
      useCase.execute({
        dto: {
          ventaId: 'venta-1',
          motivo: 'Motivo valido largo',
          items: [{ varianteId: 'var-1', cantidad: 99 }],
        },
        usuarioId: 'usr-1',
      }),
    ).rejects.toThrow('solo se vendieron');
  });

  it('registra devoluci�n correctamente', async () => {
    mockRepo.getVentaConItems.mockResolvedValue(mockVenta);
    mockRepo.findByVentaId.mockResolvedValue([]);
    mockRepo.crear.mockResolvedValue(mockDevolucion);

    const result = await useCase.execute({
      dto: {
        ventaId: 'venta-1',
        motivo: 'Producto defectuoso confirmado',
        items: [{ varianteId: 'var-1', cantidad: 2 }],
      },
      usuarioId: 'usr-1',
    });

    expect(result.estado).toBe('PENDIENTE');
    expect(mockRepo.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        ventaId: 'venta-1',
        motivo: 'Producto defectuoso confirmado',
      }),
    );
  });
});

// -- ApproveReturnUseCase --------------------------------------------------
describe('ApproveReturnUseCase', () => {
  let useCase: ApproveReturnUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ApproveReturnUseCase(mockRepo);
  });

  it('lanza ForbiddenException si el rol no es DUENO', async () => {
    await expect(
      useCase.execute({
        devolucionId: 'dev-1',
        aprobadoPorId: 'usr-1',
        aprobadoPorRol: 'EMPLEADO',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('lanza NotFoundException si la devoluci�n no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({
        devolucionId: 'dev-x',
        aprobadoPorId: 'usr-1',
        aprobadoPorRol: 'DUENO',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza DomainError si la devoluci�n no est� PENDIENTE', async () => {
    mockRepo.findById.mockResolvedValue({
      ...mockDevolucion,
      estado: 'APROBADA',
    });
    await expect(
      useCase.execute({
        devolucionId: 'dev-1',
        aprobadoPorId: 'usr-1',
        aprobadoPorRol: 'DUENO',
      }),
    ).rejects.toThrow('aprobada');
  });

  it('aprueba y reingresa stock correctamente', async () => {
    mockRepo.findById.mockResolvedValue(mockDevolucion);
    mockRepo.reingresarStock.mockResolvedValue(undefined);
    mockRepo.aprobar.mockResolvedValue({
      ...mockDevolucion,
      estado: 'APROBADA',
    });

    const result = await useCase.execute({
      devolucionId: 'dev-1',
      aprobadoPorId: 'usr-1',
      aprobadoPorRol: 'DUENO',
    });

    expect(mockRepo.reingresarStock).toHaveBeenCalledWith(mockDevolucion.items);
    expect(result.estado).toBe('APROBADA');
  });
});

// -- RejectReturnUseCase ---------------------------------------------------
describe('RejectReturnUseCase', () => {
  let useCase: RejectReturnUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RejectReturnUseCase(mockRepo);
  });

  it('lanza ForbiddenException si el rol no es DUENO', async () => {
    await expect(
      useCase.execute({
        devolucionId: 'dev-1',
        rechazadoPorId: 'usr-1',
        rechazadoPorRol: 'EMPLEADO',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('lanza NotFoundException si la devoluci�n no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({
        devolucionId: 'dev-x',
        rechazadoPorId: 'usr-1',
        rechazadoPorRol: 'DUENO',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('lanza DomainError si la devoluci�n no est� PENDIENTE', async () => {
    mockRepo.findById.mockResolvedValue({
      ...mockDevolucion,
      estado: 'RECHAZADA',
    });
    await expect(
      useCase.execute({
        devolucionId: 'dev-1',
        rechazadoPorId: 'usr-1',
        rechazadoPorRol: 'DUENO',
      }),
    ).rejects.toThrow('rechazada');
  });

  it('rechaza la devoluci�n correctamente sin reingresar stock', async () => {
    mockRepo.findById.mockResolvedValue(mockDevolucion);
    mockRepo.rechazar.mockResolvedValue({
      ...mockDevolucion,
      estado: 'RECHAZADA',
    });

    const result = await useCase.execute({
      devolucionId: 'dev-1',
      rechazadoPorId: 'usr-1',
      rechazadoPorRol: 'DUENO',
    });

    expect(mockRepo.reingresarStock).not.toHaveBeenCalled();
    expect(result.estado).toBe('RECHAZADA');
  });
});

