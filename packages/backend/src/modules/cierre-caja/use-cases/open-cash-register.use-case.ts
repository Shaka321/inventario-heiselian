import {
  Injectable,
  Inject,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { I_CIERRE_CAJA_REPOSITORY } from '../repositories/cierre-caja.repository.interface';
import type { ICierreCajaRepository, CierreCaja } from '../repositories/cierre-caja.repository.interface';
import { OpenCashRegisterDto } from '../dtos';

export interface OpenCashRegisterCommand {
  dto: OpenCashRegisterDto;
  usuarioId: string;
  usuarioRol: string;
}

@Injectable()
export class OpenCashRegisterUseCase {
  constructor(
    @Inject(I_CIERRE_CAJA_REPOSITORY)
    private readonly cierreCajaRepo: ICierreCajaRepository,
  ) {}

  async execute(command: OpenCashRegisterCommand): Promise<CierreCaja> {
    const { dto, usuarioId, usuarioRol } = command;

    if (usuarioRol !== 'DUENO') {
      throw new ForbiddenException('Solo el due�o puede abrir la caja');
    }

    const cajaAbierta = await this.cierreCajaRepo.findAbierta();
    if (cajaAbierta) {
      throw new ConflictException(
        `Ya existe una caja abierta (ID: ${cajaAbierta.id}). Ci�rrela antes de abrir una nueva.`,
      );
    }

    return this.cierreCajaRepo.abrir({
      usuarioId,
      montoInicial: dto.montoInicial,
      notas: dto.notas,
    });
  }
}



