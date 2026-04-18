import { Module } from '@nestjs/common';
import { ProductosController } from './productos.controller';
import { CreateProductoUseCase } from './use-cases/create-producto.use-case';
import { UpdateProductoUseCase } from './use-cases/update-producto.use-case';
import { SoftDeleteProductoUseCase } from './use-cases/soft-delete-producto.use-case';
import { ListProductosUseCase } from './use-cases/list-productos.use-case';
import { PrismaProductoRepository } from './infrastructure/prisma-producto.repository';
import { I_PRODUCTO_REPOSITORY } from './repositories/producto.repository.interface';
import { PrismaService } from '../../prisma.service';
import { CategoriasModule } from '../categorias/categorias.module';

@Module({
  imports: [CategoriasModule],
  controllers: [ProductosController],
  providers: [
    PrismaService,
    CreateProductoUseCase,
    UpdateProductoUseCase,
    SoftDeleteProductoUseCase,
    ListProductosUseCase,
    {
      provide: I_PRODUCTO_REPOSITORY,
      useClass: PrismaProductoRepository,
    },
  ],
  exports: [I_PRODUCTO_REPOSITORY],
})
export class ProductosModule {}
