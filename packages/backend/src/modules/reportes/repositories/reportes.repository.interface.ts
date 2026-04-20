export interface SalesByPeriodResult {
  periodo: string;
  totalVentas: number;
  cantidadTransacciones: number;
  ticketPromedio: number;
}

export interface TopSellingVariant {
  varianteId: string;
  nombreProducto: string;
  sku: string;
  cantidadVendida: number;
  totalGenerado: number;
}

export interface IncomeVsExpenseResult {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
}

export interface NetProfitResult {
  totalIngresos: number;
  totalCostos: number;
  totalDevoluciones: number;
  utilidadBruta: number;
  margenPorcentaje: number;
}

export interface CriticalStockItem {
  varianteId: string;
  nombreProducto: string;
  sku: string;
  stockActual: number;
  stockMinimo: number;
  deficit: number;
}

export interface IReportesRepository {
  salesByPeriod(params: {
    desde: Date;
    hasta: Date;
    agruparPor: 'dia' | 'semana' | 'mes';
  }): Promise<SalesByPeriodResult[]>;

  topSellingVariants(params: {
    desde: Date;
    hasta: Date;
    limit: number;
  }): Promise<TopSellingVariant[]>;

  incomeVsExpense(params: {
    desde: Date;
    hasta: Date;
  }): Promise<IncomeVsExpenseResult>;

  netProfit(params: { desde: Date; hasta: Date }): Promise<NetProfitResult>;

  criticalStock(umbralMinimo: number): Promise<CriticalStockItem[]>;
}

export const I_REPORTES_REPOSITORY = Symbol('IReportesRepository');
