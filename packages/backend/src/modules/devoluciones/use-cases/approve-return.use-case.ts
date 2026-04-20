import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { I_DEVOLUCION_REPOSITORY } from '../repositories/devolucion.repository.interface';
import type { IDevolucionRepository, Devolucion } from '../repositories/devolucion.repository.interface';
import { DomainError } from '../../../domain/errors/domain.error';

export interface ApproveReturnCommand {
  devolucionId: string;
  aprobadoPorId: string;
  aprobadoPorRol: string;
}

@Injectable()
export class ApproveReturnUseCase {
  constructor(
    @Inject(I_DEVOLUCION_REPOSITORY)
    private readonly devolucionRepo: IDevolucionRepository,
  ) {}

  async execute(command: ApproveReturnCommand): Promise<Devolucion> {
    const { devolucionId, aprobadoPorId, aprobadoPorRol } = command;

    if (aprobadoPorRol !== 'DUENO') {
      throw new ForbiddenException('Solo el due�o puede aprobar devoluciones');
    }

    const devolucion = await this.devolucionRepo.findById(devolucionId);
    if (!devolucion) {
      throw new NotFoundException(`Devoluci�n ${devolucionId} no encontrada`);
    }

    if (devolucion.estado !== 'PENDIENTE') {
      throw new DomainError(
        `La devoluci�n ya fue ${devolucion.estado.toLowerCase()}`,
        'DEVOLUCION_YA_PROCESADA',
      );
    }

    await this.devolucionRepo.reingresarStock(devolucion.items);

    return this.devolucionRepo.aprobar(devolucionId, aprobadoPorId);
  }
}



