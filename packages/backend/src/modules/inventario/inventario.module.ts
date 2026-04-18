import { Module } from '@nestjs/common';
import { InventarioController } from './inventario.controller';
import { RegisterPurchaseUseCase } from './use-cases/register-purchase.use-case';
import { AdjustStockUseCase } from './use-cases/adjust-stock.use-case';
import { GetStockReportUseCase } from './use-cases/get-stock-report.use-case';
import { PrismaInventarioRepository } from './infrastructure/prisma-inventario.repository';
import { I_INVENTARIO_REPOSITORY } from './repositories/inventario.repository.interface';
import { PrismaService } from '../../prisma.service';
import { VariantesModule } from '../variantes/variantes.module';

@Module({
  imports: [VariantesModule],
  controllers: [InventarioController],
  providers: [
    PrismaService,
    RegisterPurchaseUseCase,
    AdjustStockUseCase,
    GetStockReportUseCase,
    {
      provide: I_INVENTARIO_REPOSITORY,
      useClass: PrismaInventarioRepository,
    },
  ],
  exports: [I_INVENTARIO_REPOSITORY],
})
export class InventarioModule {}
