import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { I_CONTEO_REPOSITORY } from '../repositories/conteo.repository.interface';
import type { IConteoRepository } from '../repositories/conteo.repository.interface';
import { DomainError } from '../../../domain/errors/domain.error';

export interface CompareAndReportCommand {
  conteoId: string;
  usuarioRol: string;
}

@Injectable()
export class CompareAndReportUseCase {
  constructor(
    @Inject(I_CONTEO_REPOSITORY)
    private readonly conteoRepo: IConteoRepository,
  ) {}

  async execute(command: CompareAndReportCommand): Promise<{
    conteoId: string;
    discrepancias: {
      varianteId: string;
      cantidadContada: number;
      cantidadSistema: number;
      diferencia: number;
    }[];
    hayDiscrepancias: boolean;
    totalVariantesContadas: number;
    totalDiscrepancias: number;
  }> {
    const { conteoId, usuarioRol } = command;

    if (usuarioRol !== 'DUENO') {
      throw new ForbiddenException(
        'Solo el due�o puede ver la comparaci�n del conteo',
      );
    }

    const conteo = await this.conteoRepo.findById(conteoId);
    if (!conteo) {
      throw new NotFoundException(`Conteo ${conteoId} no encontrado`);
    }

    if (conteo.estado !== 'ENVIADO' && conteo.estado !== 'COMPARADO') {
      throw new DomainError(
        'El conteo a�n no ha sido enviado por el empleado',
        'CONTEO_NO_ENVIADO',
      );
    }

    const { discrepancias, hayDiscrepancias } =
      await this.conteoRepo.compararConSistema(conteoId);

    return {
      conteoId,
      discrepancias,
      hayDiscrepancias,
      totalVariantesContadas: conteo.items.length,
      totalDiscrepancias: discrepancias.length,
    };
  }
}



