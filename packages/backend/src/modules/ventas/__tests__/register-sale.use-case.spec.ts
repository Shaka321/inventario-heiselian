import { RegisterSaleUseCase, StockInsuficienteError } from '../use-cases/register-sale.use-case';
import { BadRequestException } from '@nestjs/common';

const makeVariante = (id: string, sku: string, precio: number, stock: number) => ({
  id, sku, precio, stock, activo: true,
});

const makePrismaMock = (variantes: any[]) => ({
  $transaction: jest.fn(async (fn: any) => {
    const tx = {
      $queryRawUnsafe: jest.fn().mockResolvedValue(variantes),
      variante: {
        update: jest.fn().mockResolvedValue(undefined),
      },
      venta: {
        create: jest.fn().mockResolvedValue(undefined),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue(undefined),
      },
    };
    return fn(tx);
  }),
});

describe('RegisterSaleUseCase', () => {
  it('debe registrar una venta correctamente', async () => {
    const variantes = [makeVariante('var-1', 'CC-500', 5.5, 100)];
    const prisma = makePrismaMock(variantes);
    const useCase = new RegisterSaleUseCase(prisma as any);

    const result = await useCase.execute(
      { items: [{ varianteId: 'var-1', cantidad: 2 }], metodoPago: 'EFECTIVO' },
      'user-1',
    );

    expect(result.id).toBeDefined();
    expect(result.total).toBe(11);
  });

  it('debe lanzar StockInsuficienteError si no hay stock', async () => {
    const variantes = [makeVariante('var-1', 'CC-500', 5.5, 1)];
    const prisma = makePrismaMock(variantes);
    const useCase = new RegisterSaleUseCase(prisma as any);

    await expect(
      useCase.execute(
        { items: [{ varianteId: 'var-1', cantidad: 5 }], metodoPago: 'EFECTIVO' },
        'user-1',
      ),
    ).rejects.toThrow(StockInsuficienteError);
  });

  it('debe lanzar BadRequestException si variante no encontrada', async () => {
    const prisma = makePrismaMock([]);
    const useCase = new RegisterSaleUseCase(prisma as any);

    await expect(
      useCase.execute(
        { items: [{ varianteId: 'var-x', cantidad: 1 }], metodoPago: 'EFECTIVO' },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('debe calcular el total correctamente con multiples items', async () => {
    const variantes = [
      makeVariante('var-1', 'CC-500', 5.5, 100),
      makeVariante('var-2', 'PP-1L', 3.0, 50),
    ];
    const prisma = makePrismaMock(variantes);
    const useCase = new RegisterSaleUseCase(prisma as any);

    const result = await useCase.execute(
      {
        items: [
          { varianteId: 'var-1', cantidad: 2 },
          { varianteId: 'var-2', cantidad: 3 },
        ],
        metodoPago: 'TARJETA',
      },
      'user-1',
    );

    expect(result.total).toBe(20);
  });

  it('debe generar checksum HMAC en el auditLog', async () => {
    const variantes = [makeVariante('var-1', 'CC-500', 5.5, 100)];
    let auditLogData: any = null;
    const prisma = {
      $transaction: jest.fn(async (fn: any) => {
        const tx = {
          $queryRawUnsafe: jest.fn().mockResolvedValue(variantes),
          variante: { update: jest.fn().mockResolvedValue(undefined) },
          venta: { create: jest.fn().mockResolvedValue(undefined) },
          auditLog: {
            create: jest.fn().mockImplementation(({ data }) => {
              auditLogData = data;
              return Promise.resolve(undefined);
            }),
          },
        };
        return fn(tx);
      }),
    };

    const useCase = new RegisterSaleUseCase(prisma as any);
    await useCase.execute(
      { items: [{ varianteId: 'var-1', cantidad: 1 }], metodoPago: 'EFECTIVO' },
      'user-1',
    );

    expect(auditLogData).not.toBeNull();
    expect(auditLogData.checksum).toHaveLength(64);
    expect(auditLogData.tipoEvento).toBe('VENTA_CREADA');
  });
});
