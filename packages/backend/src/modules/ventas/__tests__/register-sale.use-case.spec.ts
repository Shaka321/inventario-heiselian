import {
  RegisterSaleUseCase,
  StockInsuficienteError,
} from '../use-cases/register-sale.use-case';
import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../../../prisma.service';

interface VarianteMock {
  id: string;
  sku: string;
  precio: number;
  stock: number;
  activo: boolean;
}

interface AuditLogData {
  checksum: string;
  tipoEvento: string;
}

const makeVariante = (
  id: string,
  sku: string,
  precio: number,
  stock: number,
): VarianteMock => ({
  id,
  sku,
  precio,
  stock,
  activo: true,
});

const makePrismaMock = (variantes: VarianteMock[]) =>
  ({
    $transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        $queryRawUnsafe: jest.fn().mockResolvedValue(variantes),
        variante: { update: jest.fn().mockResolvedValue(undefined) },
        venta: { create: jest.fn().mockResolvedValue(undefined) },
        auditLog: { create: jest.fn().mockResolvedValue(undefined) },
      };
      return fn(tx);
    }),
  }) as unknown as PrismaService;

describe('RegisterSaleUseCase', () => {
  it('debe registrar una venta correctamente', async () => {
    const prisma = makePrismaMock([makeVariante('var-1', 'CC-500', 5.5, 100)]);
    const useCase = new RegisterSaleUseCase(prisma);

    const result = (await useCase.execute(
      { items: [{ varianteId: 'var-1', cantidad: 2 }], metodoPago: 'EFECTIVO' },
      'user-1',
    )) as { id: string; total: number };

    expect(result.id).toBeDefined();
    expect(result.total).toBe(11);
  });

  it('debe lanzar StockInsuficienteError si no hay stock', async () => {
    const prisma = makePrismaMock([makeVariante('var-1', 'CC-500', 5.5, 1)]);
    const useCase = new RegisterSaleUseCase(prisma);

    await expect(
      useCase.execute(
        {
          items: [{ varianteId: 'var-1', cantidad: 5 }],
          metodoPago: 'EFECTIVO',
        },
        'user-1',
      ),
    ).rejects.toThrow(StockInsuficienteError);
  });

  it('debe lanzar BadRequestException si variante no encontrada', async () => {
    const prisma = makePrismaMock([]);
    const useCase = new RegisterSaleUseCase(prisma);

    await expect(
      useCase.execute(
        {
          items: [{ varianteId: 'var-x', cantidad: 1 }],
          metodoPago: 'EFECTIVO',
        },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('debe calcular el total correctamente con multiples items', async () => {
    const prisma = makePrismaMock([
      makeVariante('var-1', 'CC-500', 5.5, 100),
      makeVariante('var-2', 'PP-1L', 3.0, 50),
    ]);
    const useCase = new RegisterSaleUseCase(prisma);

    const result = (await useCase.execute(
      {
        items: [
          { varianteId: 'var-1', cantidad: 2 },
          { varianteId: 'var-2', cantidad: 3 },
        ],
        metodoPago: 'TARJETA',
      },
      'user-1',
    )) as { id: string; total: number };

    expect(result.total).toBe(20);
  });

  it('debe generar checksum HMAC en el auditLog', async () => {
    const variantes = [makeVariante('var-1', 'CC-500', 5.5, 100)];
    let auditLogData: AuditLogData | null = null;

    const prisma = {
      $transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          $queryRawUnsafe: jest.fn().mockResolvedValue(variantes),
          variante: { update: jest.fn().mockResolvedValue(undefined) },
          venta: { create: jest.fn().mockResolvedValue(undefined) },
          auditLog: {
            create: jest
              .fn()
              .mockImplementation(({ data }: { data: AuditLogData }) => {
                auditLogData = data;
                return Promise.resolve(undefined);
              }),
          },
        };
        return fn(tx);
      }),
    } as unknown as PrismaService;

    const useCase = new RegisterSaleUseCase(prisma);
    await useCase.execute(
      { items: [{ varianteId: 'var-1', cantidad: 1 }], metodoPago: 'EFECTIVO' },
      'user-1',
    );

    expect(auditLogData).not.toBeNull();
    expect((auditLogData as AuditLogData).checksum).toHaveLength(64);
    expect((auditLogData as AuditLogData).tipoEvento).toBe('VENTA_CREADA');
  });
});
