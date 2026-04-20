import { Module } from '@nestjs/common';
import { AjustesController } from './ajustes.controller';
import { RegisterManualAdjustUseCase } from './use-cases/register-manual-adjust.use-case';
import { ListAdjustmentsUseCase } from './use-cases/list-adjustments.use-case';
import { PrismaAjusteRepository } from './infrastructure/prisma-ajuste.repository';
import { I_AJUSTE_REPOSITORY } from './repositories/ajuste.repository.interface';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [AjustesController],
  providers: [
    PrismaService,
    RegisterManualAdjustUseCase,
    ListAdjustmentsUseCase,
    { provide: I_AJUSTE_REPOSITORY, useClass: PrismaAjusteRepository },
  ],
})
export class AjustesModule {}
