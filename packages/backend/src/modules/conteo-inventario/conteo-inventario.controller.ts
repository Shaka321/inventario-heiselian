import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { StartBlindCountUseCase } from './use-cases/start-blind-count.use-case';
import { SubmitEmployeeCountUseCase } from './use-cases/submit-employee-count.use-case';
import { CompareAndReportUseCase } from './use-cases/compare-and-report.use-case';
import { ResolveDiscrepancyUseCase } from './use-cases/resolve-discrepancy.use-case';
import {
  StartBlindCountDto,
  SubmitEmployeeCountDto,
  ResolveDiscrepancyDto,
} from './dtos';

@Controller('conteo-inventario')
@UseGuards(JwtAuthGuard)
export class ConteoInventarioController {
  constructor(
    private readonly startBlindCount: StartBlindCountUseCase,
    private readonly submitCount: SubmitEmployeeCountUseCase,
    private readonly compareAndReport: CompareAndReportUseCase,
    private readonly resolveDiscrepancy: ResolveDiscrepancyUseCase,
  ) {}

  @Post()
  async iniciar(@Body() dto: StartBlindCountDto, @Request() req: any) {
    return this.startBlindCount.execute({
      dto,
      usuarioId: req.user.sub,
      usuarioRol: req.user.rol,
    });
  }

  @Post(':id/submit')
  async submit(
    @Param('id') id: string,
    @Body() dto: SubmitEmployeeCountDto,
    @Request() req: any,
  ) {
    return this.submitCount.execute({
      conteoId: id,
      dto,
      empleadoId: req.user.sub,
    });
  }

  @Get(':id/comparar')
  async comparar(@Param('id') id: string, @Request() req: any) {
    return this.compareAndReport.execute({
      conteoId: id,
      usuarioRol: req.user.rol,
    });
  }

  @Patch(':id/resolver')
  async resolver(
    @Param('id') id: string,
    @Body() dto: ResolveDiscrepancyDto,
    @Request() req: any,
  ) {
    return this.resolveDiscrepancy.execute({
      conteoId: id,
      dto,
      usuarioRol: req.user.rol,
    });
  }
}
