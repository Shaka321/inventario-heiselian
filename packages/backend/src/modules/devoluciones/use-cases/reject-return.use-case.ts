import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { I_DEVOLUCION_REPOSITORY } from '../repositories/devolucion.repository.interface';
import type { IDevolucionRepository, Devolucion } from '../repositories/devolucion.repository.interface';
import { DomainError } from '../../../domain/errors/domain.error';

export interface RejectReturnCommand {
  devolucionId: string;
  rechazadoPorId: string;
  rechazadoPorRol: string;
}

@Injectable()
export class RejectReturnUseCase {
  constructor(
    @Inject(I_DEVOLUCION_REPOSITORY)
    private readonly devolucionRepo: IDevolucionRepository,
  ) {}

  async execute(command: RejectReturnCommand): Promise<Devolucion> {
    const { devolucionId, rechazadoPorId, rechazadoPorRol } = command;

    if (rechazadoPorRol !== 'DUENO') {
      throw new ForbiddenException('Solo el due�o puede rechazar devoluciones');
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

    return this.devolucionRepo.rechazar(devolucionId, rechazadoPorId);
  }
}



