import { Module } from '@nestjs/common';
import { DevolucionesController } from './devoluciones.controller';
import { RegisterReturnUseCase } from './use-cases/register-return.use-case';
import { ApproveReturnUseCase } from './use-cases/approve-return.use-case';
import { RejectReturnUseCase } from './use-cases/reject-return.use-case';
import { PrismaDevolucionRepository } from './infrastructure/prisma-devolucion.repository';
import { I_DEVOLUCION_REPOSITORY } from './repositories/devolucion.repository.interface';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [DevolucionesController],
  providers: [
    PrismaService,
    RegisterReturnUseCase,
    ApproveReturnUseCase,
    RejectReturnUseCase,
    { provide: I_DEVOLUCION_REPOSITORY, useClass: PrismaDevolucionRepository },
  ],
})
export class DevolucionesModule {}
