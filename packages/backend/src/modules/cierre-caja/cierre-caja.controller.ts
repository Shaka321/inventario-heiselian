import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { OpenCashRegisterUseCase } from './use-cases/open-cash-register.use-case';
import { CloseCashRegisterUseCase } from './use-cases/close-cash-register.use-case';
import { GetCashRegisterHistoryUseCase } from './use-cases/get-cash-register-history.use-case';
import {
  OpenCashRegisterDto,
  CloseCashRegisterDto,
  GetCashRegisterHistoryDto,
} from './dtos';

@Controller('cierre-caja')
@UseGuards(JwtAuthGuard)
export class CierreCajaController {
  constructor(
    private readonly openCashRegister: OpenCashRegisterUseCase,
    private readonly closeCashRegister: CloseCashRegisterUseCase,
    private readonly getHistory: GetCashRegisterHistoryUseCase,
  ) {}

  @Post('abrir')
  async abrir(@Body() dto: OpenCashRegisterDto, @Request() req: any) {
    return this.openCashRegister.execute({
      dto,
      usuarioId: req.user.sub,
      usuarioRol: req.user.rol,
    });
  }

  @Patch(':id/cerrar')
  async cerrar(
    @Param('id') id: string,
    @Body() dto: CloseCashRegisterDto,
    @Request() req: any,
  ) {
    return this.closeCashRegister.execute({
      id,
      dto,
      usuarioId: req.user.sub,
      usuarioRol: req.user.rol,
    });
  }

  @Get()
  async historial(@Query() query: GetCashRegisterHistoryDto) {
    return this.getHistory.execute(query);
  }
}
