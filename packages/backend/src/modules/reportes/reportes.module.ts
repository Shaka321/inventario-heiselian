import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { SalesByPeriodUseCase } from './use-cases/sales-by-period.use-case';
import { TopSellingVariantsUseCase } from './use-cases/top-selling-variants.use-case';
import { IncomeVsExpenseUseCase } from './use-cases/income-vs-expense.use-case';
import { NetProfitUseCase } from './use-cases/net-profit.use-case';
import { CriticalStockUseCase } from './use-cases/critical-stock.use-case';
import { PrismaReportesRepository } from './infrastructure/prisma-reportes.repository';
import { I_REPORTES_REPOSITORY } from './repositories/reportes.repository.interface';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ReportesController],
  providers: [
    PrismaService,
    SalesByPeriodUseCase,
    TopSellingVariantsUseCase,
    IncomeVsExpenseUseCase,
    NetProfitUseCase,
    CriticalStockUseCase,
    { provide: I_REPORTES_REPOSITORY, useClass: PrismaReportesRepository },
  ],
})
export class ReportesModule {}
