import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RegisterManualAdjustUseCase } from './use-cases/register-manual-adjust.use-case';
import { ListAdjustmentsUseCase } from './use-cases/list-adjustments.use-case';
import { RegisterManualAdjustDto, ListAdjustmentsDto } from './dtos';

@Controller('ajustes')
@UseGuards(JwtAuthGuard)
export class AjustesController {
  constructor(
    private readonly registerAdjust: RegisterManualAdjustUseCase,
    private readonly listAdjustments: ListAdjustmentsUseCase,
  ) {}

  @Post()
  async registrar(@Body() dto: RegisterManualAdjustDto, @Request() req: any) {
    return this.registerAdjust.execute({
      dto,
      usuarioId: req.user.sub,
      usuarioRol: req.user.rol,
    });
  }

  @Get()
  async listar(@Query() query: ListAdjustmentsDto) {
    return this.listAdjustments.execute(query);
  }
}
