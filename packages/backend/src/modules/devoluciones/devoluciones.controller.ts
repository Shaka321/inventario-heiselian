import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RegisterReturnUseCase } from './use-cases/register-return.use-case';
import { ApproveReturnUseCase } from './use-cases/approve-return.use-case';
import { RejectReturnUseCase } from './use-cases/reject-return.use-case';
import { RegisterReturnDto, ListDevolucionesDto } from './dtos';
import { I_DEVOLUCION_REPOSITORY } from './repositories/devolucion.repository.interface';
import type { IDevolucionRepository } from './repositories/devolucion.repository.interface';
import { Inject } from '@nestjs/common';

@Controller('devoluciones')
@UseGuards(JwtAuthGuard)
export class DevolucionesController {
  constructor(
    private readonly registerReturn: RegisterReturnUseCase,
    private readonly approveReturn: ApproveReturnUseCase,
    private readonly rejectReturn: RejectReturnUseCase,
    @Inject(I_DEVOLUCION_REPOSITORY)
    private readonly devolucionRepo: IDevolucionRepository,
  ) {}

  @Post()
  async registrar(@Body() dto: RegisterReturnDto, @Request() req: any) {
    return this.registerReturn.execute({ dto, usuarioId: req.user.sub });
  }

  @Patch(':id/aprobar')
  async aprobar(@Param('id') id: string, @Request() req: any) {
    return this.approveReturn.execute({
      devolucionId: id,
      aprobadoPorId: req.user.sub,
      aprobadoPorRol: req.user.rol,
    });
  }

  @Patch(':id/rechazar')
  async rechazar(@Param('id') id: string, @Request() req: any) {
    return this.rejectReturn.execute({
      devolucionId: id,
      rechazadoPorId: req.user.sub,
      rechazadoPorRol: req.user.rol,
    });
  }

  @Get()
  async listar(@Query() query: ListDevolucionesDto) {
    return this.devolucionRepo.listar({
      estado: query.estado,
      usuarioId: query.usuarioId,
      desde: query.desde ? new Date(query.desde) : undefined,
      hasta: query.hasta ? new Date(query.hasta) : undefined,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.devolucionRepo.findById(id);
  }
}



