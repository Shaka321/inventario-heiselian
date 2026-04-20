/* eslint-disable @typescript-eslint/unbound-method */
import { SalesByPeriodUseCase } from '../use-cases/sales-by-period.use-case';
import { TopSellingVariantsUseCase } from '../use-cases/top-selling-variants.use-case';
import { IncomeVsExpenseUseCase } from '../use-cases/income-vs-expense.use-case';
import { NetProfitUseCase } from '../use-cases/net-profit.use-case';
import { CriticalStockUseCase } from '../use-cases/critical-stock.use-case';
import { IReportesRepository } from '../repositories/reportes.repository.interface';
import { RedisCacheService } from '../../../shared/cache/redis-cache.service';

const mockRepo: jest.Mocked<IReportesRepository> = {
  salesByPeriod: jest.fn(),
  topSellingVariants: jest.fn(),
  incomeVsExpense: jest.fn(),
  netProfit: jest.fn(),
  criticalStock: jest.fn(),
};

const mockCache: jest.Mocked<RedisCacheService> = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  getVersion: jest.fn(),
  incrementVersion: jest.fn(),
  invalidateNamespace: jest.fn(),
  buildVersionedKey: jest.fn(),
  onModuleDestroy: jest.fn(),
} as any;

const DTO_PERIODO = { desde: '2025-01-01', hasta: '2025-01-31' };

beforeEach(() => {
  jest.clearAllMocks();
  mockCache.buildVersionedKey.mockResolvedValue('reporte:test:v1');
  mockCache.get.mockResolvedValue(null);
  mockCache.set.mockResolvedValue(undefined);
});

// -- SalesByPeriodUseCase --------------------------------------------------
describe('SalesByPeriodUseCase', () => {
  let useCase: SalesByPeriodUseCase;

  beforeEach(() => {
    useCase = new SalesByPeriodUseCase(mockRepo, mockCache);
  });

  it('retorna datos del repositorio cuando cache miss', async () => {
    const mockData = [
      {
        periodo: '2025-01-01',
        totalVentas: 500,
        cantidadTransacciones: 3,
        ticketPromedio: 166.67,
      },
    ];
    mockRepo.salesByPeriod.mockResolvedValue(mockData);

    const result = await useCase.execute({ ...DTO_PERIODO, agruparPor: 'dia' });

    expect(result).toEqual(mockData);
    expect(mockRepo.salesByPeriod).toHaveBeenCalledTimes(1);
    expect(mockCache.set).toHaveBeenCalledTimes(1);
  });

  it('retorna datos del cache cuando cache hit', async () => {
    const cachedData = [
      {
        periodo: '2025-01-01',
        totalVentas: 999,
        cantidadTransacciones: 1,
        ticketPromedio: 999,
      },
    ];
    mockCache.get.mockResolvedValue(cachedData);

    const result = await useCase.execute({ ...DTO_PERIODO, agruparPor: 'dia' });

    expect(result).toEqual(cachedData);
    expect(mockRepo.salesByPeriod).not.toHaveBeenCalled();
    expect(mockCache.set).not.toHaveBeenCalled();
  });

  it('construye clave con version correcta', async () => {
    mockRepo.salesByPeriod.mockResolvedValue([]);

    await useCase.execute({ ...DTO_PERIODO, agruparPor: 'mes' });

    expect(mockCache.buildVersionedKey).toHaveBeenCalledWith(
      'reporte:ventas',
      expect.stringContaining('mes'),
    );
  });
});

// -- TopSellingVariantsUseCase ---------------------------------------------
describe('TopSellingVariantsUseCase', () => {
  let useCase: TopSellingVariantsUseCase;

  beforeEach(() => {
    useCase = new TopSellingVariantsUseCase(mockRepo, mockCache);
  });

  it('retorna top variantes desde repositorio en cache miss', async () => {
    const mockData = [
      {
        varianteId: 'var-1',
        nombreProducto: 'Prod A',
        sku: 'SKU-001',
        cantidadVendida: 50,
        totalGenerado: 2500,
      },
    ];
    mockRepo.topSellingVariants.mockResolvedValue(mockData);

    const result = await useCase.execute({ ...DTO_PERIODO, limit: 10 });

    expect(result).toEqual(mockData);
    expect(mockRepo.topSellingVariants).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10 }),
    );
  });

  it('retorna desde cache en cache hit', async () => {
    const cachedData = [
      {
        varianteId: 'var-cached',
        nombreProducto: 'Cached',
        sku: 'SKU-C',
        cantidadVendida: 99,
        totalGenerado: 9999,
      },
    ];
    mockCache.get.mockResolvedValue(cachedData);

    const result = await useCase.execute({ ...DTO_PERIODO, limit: 5 });

    expect(result).toEqual(cachedData);
    expect(mockRepo.topSellingVariants).not.toHaveBeenCalled();
  });
});

// -- IncomeVsExpenseUseCase ------------------------------------------------
describe('IncomeVsExpenseUseCase', () => {
  let useCase: IncomeVsExpenseUseCase;

  beforeEach(() => {
    useCase = new IncomeVsExpenseUseCase(mockRepo, mockCache);
  });

  it('calcula balance correctamente desde repositorio', async () => {
    mockRepo.incomeVsExpense.mockResolvedValue({
      totalIngresos: 10000,
      totalEgresos: 6000,
      balance: 4000,
    });

    const result = await useCase.execute(DTO_PERIODO);

    expect(result.balance).toBe(4000);
    expect(result.totalIngresos).toBe(10000);
  });

  it('usa cache en hit', async () => {
    mockCache.get.mockResolvedValue({
      totalIngresos: 999,
      totalEgresos: 111,
      balance: 888,
    });

    const result = await useCase.execute(DTO_PERIODO);

    expect(result.balance).toBe(888);
    expect(mockRepo.incomeVsExpense).not.toHaveBeenCalled();
  });
});

// -- NetProfitUseCase ------------------------------------------------------
describe('NetProfitUseCase', () => {
  let useCase: NetProfitUseCase;

  beforeEach(() => {
    useCase = new NetProfitUseCase(mockRepo, mockCache);
  });

  it('retorna utilidad neta correctamente', async () => {
    mockRepo.netProfit.mockResolvedValue({
      totalIngresos: 10000,
      totalCostos: 6000,
      totalDevoluciones: 500,
      utilidadBruta: 3500,
      margenPorcentaje: 35,
    });

    const result = await useCase.execute(DTO_PERIODO);

    expect(result.utilidadBruta).toBe(3500);
    expect(result.margenPorcentaje).toBe(35);
  });

  it('usa cache en hit', async () => {
    mockCache.get.mockResolvedValue({
      totalIngresos: 1,
      totalCostos: 1,
      totalDevoluciones: 0,
      utilidadBruta: 0,
      margenPorcentaje: 0,
    });

    await useCase.execute(DTO_PERIODO);

    expect(mockRepo.netProfit).not.toHaveBeenCalled();
  });
});

// -- CriticalStockUseCase --------------------------------------------------
describe('CriticalStockUseCase', () => {
  let useCase: CriticalStockUseCase;

  beforeEach(() => {
    useCase = new CriticalStockUseCase(mockRepo, mockCache);
  });

  it('retorna items con stock critico', async () => {
    const mockData = [
      {
        varianteId: 'var-1',
        nombreProducto: 'Prod A',
        sku: 'SKU-001',
        stockActual: 2,
        stockMinimo: 5,
        deficit: 3,
      },
    ];
    mockRepo.criticalStock.mockResolvedValue(mockData);

    const result = await useCase.execute({ umbralMinimo: 5 });

    expect(result).toHaveLength(1);
    expect(result[0].deficit).toBe(3);
    expect(mockRepo.criticalStock).toHaveBeenCalledWith(5);
  });

  it('usa umbral por defecto de 5 cuando no se provee', async () => {
    mockRepo.criticalStock.mockResolvedValue([]);

    await useCase.execute({});

    expect(mockRepo.criticalStock).toHaveBeenCalledWith(5);
  });

  it('usa cache en hit', async () => {
    mockCache.get.mockResolvedValue([]);

    await useCase.execute({ umbralMinimo: 10 });

    expect(mockRepo.criticalStock).not.toHaveBeenCalled();
  });

  it('construye clave con namespace correcto para stock critico', async () => {
    mockRepo.criticalStock.mockResolvedValue([]);

    await useCase.execute({ umbralMinimo: 3 });

    expect(mockCache.buildVersionedKey).toHaveBeenCalledWith(
      'reporte:stock-critico',
      expect.stringContaining('3'),
    );
  });
});

