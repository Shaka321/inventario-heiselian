import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreateCategoriaUseCase } from './use-cases/create-categoria.use-case';
import { UpdateCategoriaUseCase } from './use-cases/update-categoria.use-case';
import { ListCategoriasUseCase } from './use-cases/list-categorias.use-case';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dtos';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@Controller('categorias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriasController {
  constructor(
    private readonly createCategoriaUseCase: CreateCategoriaUseCase,
    private readonly updateCategoriaUseCase: UpdateCategoriaUseCase,
    private readonly listCategoriasUseCase: ListCategoriasUseCase,
  ) {}

  @Get()
  async list(@Query('todas') todas?: string) {
    const soloActivas = todas !== 'true';
    return this.listCategoriasUseCase.execute(soloActivas);
  }

  @Post()
  @Roles('DUENO', 'SUPERVISOR')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCategoriaDto) {
    return this.createCategoriaUseCase.execute(dto);
  }

  @Patch(':id')
  @Roles('DUENO', 'SUPERVISOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdateCategoriaDto) {
    await this.updateCategoriaUseCase.execute(id, dto);
  }
}
