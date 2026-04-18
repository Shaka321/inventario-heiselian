import { Module } from '@nestjs/common';
import { PreciosController } from './precios.controller';
import { UpdatePriceUseCase } from './use-cases/update-price.use-case';
import { GetPriceHistoryUseCase } from './use-cases/get-price-history.use-case';
import { PrismaPrecioRepository } from './infrastructure/prisma-precio.repository';
import { I_PRECIO_REPOSITORY } from './repositories/precio.repository.interface';
import { PrismaService } from '../../prisma.service';
import { VariantesModule } from '../variantes/variantes.module';

@Module({
  imports: [VariantesModule],
  controllers: [PreciosController],
  providers: [
    PrismaService,
    UpdatePriceUseCase,
    GetPriceHistoryUseCase,
    {
      provide: I_PRECIO_REPOSITORY,
      useClass: PrismaPrecioRepository,
    },
  ],
  exports: [I_PRECIO_REPOSITORY],
})
export class PreciosModule {}
