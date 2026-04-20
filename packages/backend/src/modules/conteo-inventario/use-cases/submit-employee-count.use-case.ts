import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { I_CONTEO_REPOSITORY } from '../repositories/conteo.repository.interface';
import type { IConteoRepository, ConteoInventario } from '../repositories/conteo.repository.interface';
import { SubmitEmployeeCountDto } from '../dtos';
import { DomainError } from '../../../domain/errors/domain.error';

export interface SubmitEmployeeCountCommand {
  conteoId: string;
  dto: SubmitEmployeeCountDto;
  empleadoId: string;
}

@Injectable()
export class SubmitEmployeeCountUseCase {
  constructor(
    @Inject(I_CONTEO_REPOSITORY)
    private readonly conteoRepo: IConteoRepository,
  ) {}

  async execute(
    command: SubmitEmployeeCountCommand,
  ): Promise<ConteoInventario> {
    const { conteoId, dto, empleadoId } = command;

    const conteo = await this.conteoRepo.findById(conteoId);
    if (!conteo) {
      throw new NotFoundException(`Conteo ${conteoId} no encontrado`);
    }

    if (conteo.estado !== 'EN_PROGRESO') {
      throw new DomainError(
        `El conteo ya fue ${conteo.estado.toLowerCase().replace('_', ' ')}`,
        'CONTEO_NO_EN_PROGRESO',
      );
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException(
        'Debe ingresar al menos un item en el conteo',
      );
    }

    // Validar que solo se cuenten variantes del conteo � sin revelar stock
    const varianteIdsConteo = conteo.items.map((i) => i.varianteId);
    for (const item of dto.items) {
      if (!varianteIdsConteo.includes(item.varianteId)) {
        throw new DomainError(
          `La variante ${item.varianteId} no forma parte de este conteo`,
          'VARIANTE_NO_EN_CONTEO',
        );
      }
      if (item.cantidadContada < 0) {
        throw new DomainError(
          `La cantidad contada no puede ser negativa para variante ${item.varianteId}`,
          'CANTIDAD_INVALIDA',
        );
      }
    }

    return this.conteoRepo.submitConteo({
      id: conteoId,
      empleadoId,
      items: dto.items,
    });
  }
}



