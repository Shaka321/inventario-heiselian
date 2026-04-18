import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreateProductoUseCase } from './use-cases/create-producto.use-case';
import { UpdateProductoUseCase } from './use-cases/update-producto.use-case';
import { SoftDeleteProductoUseCase } from './use-cases/soft-delete-producto.use-case';
import { ListProductosUseCase } from './use-cases/list-productos.use-case';
import { CreateProductoDto, UpdateProductoDto } from './dtos';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@Controller('productos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductosController {
  constructor(
    private readonly createProductoUseCase: CreateProductoUseCase,
    private readonly updateProductoUseCase: UpdateProductoUseCase,
    private readonly softDeleteProductoUseCase: SoftDeleteProductoUseCase,
    private readonly listProductosUseCase: ListProductosUseCase,
  ) {}

  @Get()
  async list(@Query('todos') todos?: string) {
    const soloActivos = todos !== 'true';
    return this.listProductosUseCase.execute(soloActivos);
  }

  @Post()
  @Roles('DUENO', 'SUPERVISOR')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductoDto) {
    return this.createProductoUseCase.execute(dto);
  }

  @Patch(':id')
  @Roles('DUENO', 'SUPERVISOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdateProductoDto) {
    await this.updateProductoUseCase.execute(id, dto);
  }

  @Delete(':id')
  @Roles('DUENO')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(@Param('id') id: string) {
    await this.softDeleteProductoUseCase.execute(id);
  }
}
