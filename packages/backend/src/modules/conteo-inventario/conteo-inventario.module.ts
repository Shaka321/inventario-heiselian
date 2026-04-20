import { Module } from '@nestjs/common';
import { ConteoInventarioController } from './conteo-inventario.controller';
import { StartBlindCountUseCase } from './use-cases/start-blind-count.use-case';
import { SubmitEmployeeCountUseCase } from './use-cases/submit-employee-count.use-case';
import { CompareAndReportUseCase } from './use-cases/compare-and-report.use-case';
import { ResolveDiscrepancyUseCase } from './use-cases/resolve-discrepancy.use-case';
import { PrismaConteoRepository } from './infrastructure/prisma-conteo.repository';
import { I_CONTEO_REPOSITORY } from './repositories/conteo.repository.interface';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ConteoInventarioController],
  providers: [
    PrismaService,
    StartBlindCountUseCase,
    SubmitEmployeeCountUseCase,
    CompareAndReportUseCase,
    ResolveDiscrepancyUseCase,
    { provide: I_CONTEO_REPOSITORY, useClass: PrismaConteoRepository },
  ],
})
export class ConteoInventarioModule {}
