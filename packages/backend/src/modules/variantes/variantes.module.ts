import { Module } from '@nestjs/common';
import { VariantesController } from './variantes.controller';
import { CreateVarianteUseCase } from './use-cases/create-variante.use-case';
import { UpdateVarianteUseCase } from './use-cases/update-variante.use-case';
import { ListVariantesByProductoUseCase } from './use-cases/list-variantes-by-producto.use-case';
import { GetVarianteStockUseCase } from './use-cases/get-variante-stock.use-case';
import { PrismaVarianteRepository } from './infrastructure/prisma-variante.repository';
import { I_VARIANTE_REPOSITORY } from './repositories/variante.repository.interface';
import { PrismaService } from '../../prisma.service';
import { ProductosModule } from '../productos/productos.module';

@Module({
  imports: [ProductosModule],
  controllers: [VariantesController],
  providers: [
    PrismaService,
    CreateVarianteUseCase,
    UpdateVarianteUseCase,
    ListVariantesByProductoUseCase,
    GetVarianteStockUseCase,
    {
      provide: I_VARIANTE_REPOSITORY,
      useClass: PrismaVarianteRepository,
    },
  ],
  exports: [I_VARIANTE_REPOSITORY, PrismaService],
})
export class VariantesModule {}
