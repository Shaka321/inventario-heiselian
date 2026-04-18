import { Module } from '@nestjs/common';
import { CategoriasController } from './categorias.controller';
import { CreateCategoriaUseCase } from './use-cases/create-categoria.use-case';
import { UpdateCategoriaUseCase } from './use-cases/update-categoria.use-case';
import { ListCategoriasUseCase } from './use-cases/list-categorias.use-case';
import { PrismaCategoriaRepository } from './infrastructure/prisma-categoria.repository';
import { I_CATEGORIA_REPOSITORY } from './repositories/categoria.repository.interface';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [CategoriasController],
  providers: [
    PrismaService,
    CreateCategoriaUseCase,
    UpdateCategoriaUseCase,
    ListCategoriasUseCase,
    {
      provide: I_CATEGORIA_REPOSITORY,
      useClass: PrismaCategoriaRepository,
    },
  ],
  exports: [I_CATEGORIA_REPOSITORY],
})
export class CategoriasModule {}
