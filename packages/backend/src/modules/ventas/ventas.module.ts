import { Module } from '@nestjs/common';
import { VentasController } from './ventas.controller';
import { RegisterSaleUseCase } from './use-cases/register-sale.use-case';
import { CancelSaleUseCase } from './use-cases/cancel-sale.use-case';
import { GetSaleByIdUseCase } from './use-cases/get-sale-by-id.use-case';
import { ListSalesUseCase } from './use-cases/list-sales.use-case';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [VentasController],
  providers: [
    PrismaService,
    RegisterSaleUseCase,
    CancelSaleUseCase,
    GetSaleByIdUseCase,
    ListSalesUseCase,
  ],
  exports: [PrismaService],
})
export class VentasModule {}
