import { Module } from '@nestjs/common';
import { CierreCajaController } from './cierre-caja.controller';
import { OpenCashRegisterUseCase } from './use-cases/open-cash-register.use-case';
import { CloseCashRegisterUseCase } from './use-cases/close-cash-register.use-case';
import { GetCashRegisterHistoryUseCase } from './use-cases/get-cash-register-history.use-case';
import { PrismaCierreCajaRepository } from './infrastructure/prisma-cierre-caja.repository';
import { I_CIERRE_CAJA_REPOSITORY } from './repositories/cierre-caja.repository.interface';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [CierreCajaController],
  providers: [
    PrismaService,
    OpenCashRegisterUseCase,
    CloseCashRegisterUseCase,
    GetCashRegisterHistoryUseCase,
    { provide: I_CIERRE_CAJA_REPOSITORY, useClass: PrismaCierreCajaRepository },
  ],
})
export class CierreCajaModule {}
