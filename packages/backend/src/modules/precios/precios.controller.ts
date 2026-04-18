import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UpdatePriceUseCase } from './use-cases/update-price.use-case';
import { GetPriceHistoryUseCase } from './use-cases/get-price-history.use-case';
import { UpdatePriceDto } from './dtos';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserData } from '../../shared/decorators/current-user.decorator';

@Controller('precios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PreciosController {
  constructor(
    private readonly updatePriceUseCase: UpdatePriceUseCase,
    private readonly getPriceHistoryUseCase: GetPriceHistoryUseCase,
  ) {}

  @Post('actualizar')
  @Roles('DUENO', 'SUPERVISOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePrice(
    @Body() dto: UpdatePriceDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.updatePriceUseCase.execute(dto, user.id);
  }

  @Get('historial/:varianteId')
  @Roles('DUENO', 'SUPERVISOR')
  async getPriceHistory(@Param('varianteId') varianteId: string) {
    return this.getPriceHistoryUseCase.execute(varianteId);
  }
}
