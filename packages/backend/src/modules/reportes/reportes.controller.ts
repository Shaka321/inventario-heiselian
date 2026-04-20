import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { SalesByPeriodUseCase } from './use-cases/sales-by-period.use-case';
import { TopSellingVariantsUseCase } from './use-cases/top-selling-variants.use-case';
import { IncomeVsExpenseUseCase } from './use-cases/income-vs-expense.use-case';
import { NetProfitUseCase } from './use-cases/net-profit.use-case';
import { CriticalStockUseCase } from './use-cases/critical-stock.use-case';
import {
  SalesByPeriodDto,
  TopSellingDto,
  PeriodFilterDto,
  CriticalStockDto,
} from './dtos';

@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(
    private readonly salesByPeriod: SalesByPeriodUseCase,
    private readonly topSelling: TopSellingVariantsUseCase,
    private readonly incomeVsExpense: IncomeVsExpenseUseCase,
    private readonly netProfit: NetProfitUseCase,
    private readonly criticalStock: CriticalStockUseCase,
  ) {}

  private solodueno(req: any) {
    if (req.user.rol !== 'DUENO') {
      throw new ForbiddenException(
        'Solo el due�o puede acceder a los reportes',
      );
    }
  }

  @Get('ventas-por-periodo')
  async ventasPorPeriodo(@Query() dto: SalesByPeriodDto, @Request() req: any) {
    this.solodueno(req);
    return this.salesByPeriod.execute(dto);
  }

  @Get('top-variantes')
  async topVariantes(@Query() dto: TopSellingDto, @Request() req: any) {
    this.solodueno(req);
    return this.topSelling.execute(dto);
  }

  @Get('ingresos-vs-egresos')
  async ingresosVsEgresos(@Query() dto: PeriodFilterDto, @Request() req: any) {
    this.solodueno(req);
    return this.incomeVsExpense.execute(dto);
  }

  @Get('utilidad-neta')
  async utilidadNeta(@Query() dto: PeriodFilterDto, @Request() req: any) {
    this.solodueno(req);
    return this.netProfit.execute(dto);
  }

  @Get('stock-critico')
  async stockCritico(@Query() dto: CriticalStockDto, @Request() req: any) {
    this.solodueno(req);
    return this.criticalStock.execute(dto);
  }
}
