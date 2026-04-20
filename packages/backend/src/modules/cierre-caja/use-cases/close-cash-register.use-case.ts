import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { I_CIERRE_CAJA_REPOSITORY } from '../repositories/cierre-caja.repository.interface';
import type { ICierreCajaRepository, CierreCaja } from '../repositories/cierre-caja.repository.interface';
import { CloseCashRegisterDto } from '../dtos';
import { DomainError } from '../../../domain/errors/domain.error';

export interface CloseCashRegisterCommand {
  id: string;
  dto: CloseCashRegisterDto;
  usuarioId: string;
  usuarioRol: string;
}

@Injectable()
export class CloseCashRegisterUseCase {
  constructor(
    @Inject(I_CIERRE_CAJA_REPOSITORY)
    private readonly cierreCajaRepo: ICierreCajaRepository,
  ) {}

  async execute(command: CloseCashRegisterCommand): Promise<CierreCaja> {
    const { id, dto, usuarioRol } = command;

    if (usuarioRol !== 'DUENO') {
      throw new ForbiddenException('Solo el due�o puede cerrar la caja');
    }

    const caja = await this.cierreCajaRepo.findById(id);
    if (!caja) {
      throw new NotFoundException(`Caja ${id} no encontrada`);
    }

    if (caja.estado === 'CERRADA') {
      throw new DomainError('Esta caja ya est� cerrada', 'CAJA_YA_CERRADA');
    }

    return this.cierreCajaRepo.cerrar({
      id,
      montoFinal: dto.montoFinal,
      notas: dto.notas,
    });
  }
}



