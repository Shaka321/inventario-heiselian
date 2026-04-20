import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { I_CONTEO_REPOSITORY } from '../repositories/conteo.repository.interface';
import type { IConteoRepository, ConteoInventario } from '../repositories/conteo.repository.interface';
import { ResolveDiscrepancyDto } from '../dtos';
import { DomainError } from '../../../domain/errors/domain.error';

export interface ResolveDiscrepancyCommand {
  conteoId: string;
  dto: ResolveDiscrepancyDto;
  usuarioRol: string;
}

@Injectable()
export class ResolveDiscrepancyUseCase {
  constructor(
    @Inject(I_CONTEO_REPOSITORY)
    private readonly conteoRepo: IConteoRepository,
  ) {}

  async execute(command: ResolveDiscrepancyCommand): Promise<ConteoInventario> {
    const { conteoId, dto, usuarioRol } = command;

    if (usuarioRol !== 'DUENO') {
      throw new ForbiddenException(
        'Solo el due�o puede resolver discrepancias',
      );
    }

    const conteo = await this.conteoRepo.findById(conteoId);
    if (!conteo) {
      throw new NotFoundException(`Conteo ${conteoId} no encontrado`);
    }

    if (conteo.estado !== 'ENVIADO' && conteo.estado !== 'COMPARADO') {
      throw new DomainError(
        'El conteo debe estar en estado ENVIADO o COMPARADO para resolver discrepancias',
        'ESTADO_INVALIDO_PARA_RESOLVER',
      );
    }

    return this.conteoRepo.resolver(conteoId, dto.aplicarAjuste);
  }
}



