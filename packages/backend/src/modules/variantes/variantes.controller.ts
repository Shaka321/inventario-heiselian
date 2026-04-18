import { Controller, Get, Post, Patch, Param, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CreateVarianteUseCase } from './use-cases/create-variante.use-case';
import { UpdateVarianteUseCase } from './use-cases/update-variante.use-case';
import { ListVariantesByProductoUseCase } from './use-cases/list-variantes-by-producto.use-case';
import { GetVarianteStockUseCase } from './use-cases/get-variante-stock.use-case';
import { CreateVarianteDto, UpdateVarianteDto } from './dtos';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@Controller('variantes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VariantesController {
  constructor(
    private readonly createVarianteUseCase: CreateVarianteUseCase,
    private readonly updateVarianteUseCase: UpdateVarianteUseCase,
    private readonly listVariantesByProductoUseCase: ListVariantesByProductoUseCase,
    private readonly getVarianteStockUseCase: GetVarianteStockUseCase,
  ) {}

  @Get('producto/:productoId')
  async listByProducto(@Param('productoId') productoId: string) {
    return this.listVariantesByProductoUseCase.execute(productoId);
  }

  @Get(':id/stock')
  async getStock(@Param('id') id: string) {
    return this.getVarianteStockUseCase.execute(id);
  }

  @Post()
  @Roles('DUENO', 'SUPERVISOR')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateVarianteDto) {
    return this.createVarianteUseCase.execute(dto);
  }

  @Patch(':id')
  @Roles('DUENO', 'SUPERVISOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdateVarianteDto) {
    await this.updateVarianteUseCase.execute(id, dto);
  }
}
