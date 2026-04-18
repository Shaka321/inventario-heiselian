import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RegisterSaleUseCase } from './use-cases/register-sale.use-case';
import { CancelSaleUseCase } from './use-cases/cancel-sale.use-case';
import { GetSaleByIdUseCase } from './use-cases/get-sale-by-id.use-case';
import { ListSalesUseCase } from './use-cases/list-sales.use-case';
import { RegisterSaleDto } from './dtos';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserData } from '../../shared/decorators/current-user.decorator';

@Controller('ventas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VentasController {
  constructor(
    private readonly registerSaleUseCase: RegisterSaleUseCase,
    private readonly cancelSaleUseCase: CancelSaleUseCase,
    private readonly getSaleByIdUseCase: GetSaleByIdUseCase,
    private readonly listSalesUseCase: ListSalesUseCase,
  ) {}

  @Get()
  @Roles('DUENO', 'SUPERVISOR')
  async list(
    @Query('usuarioId') usuarioId?: string,
    @Query('estado') estado?: string,
  ) {
    return this.listSalesUseCase.execute({ usuarioId, estado });
  }

  @Get(':id')
  @Roles('DUENO', 'SUPERVISOR', 'EMPLEADO')
  async getById(@Param('id') id: string) {
    return this.getSaleByIdUseCase.execute(id);
  }

  @Post()
  @Roles('DUENO', 'SUPERVISOR', 'EMPLEADO')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterSaleDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.registerSaleUseCase.execute(dto, user.id);
  }

  @Post(':id/cancelar')
  @Roles('DUENO', 'SUPERVISOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    await this.cancelSaleUseCase.execute(id, user.id);
  }
}
