import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { RegisterPurchaseUseCase } from './use-cases/register-purchase.use-case';
import { AdjustStockUseCase } from './use-cases/adjust-stock.use-case';
import { GetStockReportUseCase } from './use-cases/get-stock-report.use-case';
import { RegisterPurchaseDto, AdjustStockDto } from './dtos';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserData } from '../../shared/decorators/current-user.decorator';

@Controller('inventario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventarioController {
  constructor(
    private readonly registerPurchaseUseCase: RegisterPurchaseUseCase,
    private readonly adjustStockUseCase: AdjustStockUseCase,
    private readonly getStockReportUseCase: GetStockReportUseCase,
  ) {}

  @Get('stock-report')
  @Roles('DUENO', 'SUPERVISOR')
  async stockReport() {
    return this.getStockReportUseCase.execute();
  }

  @Post('compra')
  @Roles('DUENO', 'SUPERVISOR')
  @HttpCode(HttpStatus.CREATED)
  async registerPurchase(@Body() dto: RegisterPurchaseDto) {
    return this.registerPurchaseUseCase.execute(dto);
  }

  @Post('ajuste-stock')
  @Roles('DUENO', 'SUPERVISOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async adjustStock(
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    dto.usuarioId = user.id;
    await this.adjustStockUseCase.execute(dto);
  }
}
