import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { I_AJUSTE_REPOSITORY } from '../repositories/ajuste.repository.interface';
import type { IAjusteRepository, AjusteManual } from '../repositories/ajuste.repository.interface';
import { RegisterManualAdjustDto } from '../dtos';
import { DomainError } from '../../../domain/errors/domain.error';

const UMBRAL_ALERTA_UNIDADES = 50;

export interface RegisterManualAdjustCommand {
  dto: RegisterManualAdjustDto;
  usuarioId: string;
  usuarioRol: string;
}

@Injectable()
export class RegisterManualAdjustUseCase {
  constructor(
    @Inject(I_AJUSTE_REPOSITORY)
    private readonly ajusteRepo: IAjusteRepository,
  ) {}

  async execute(command: RegisterManualAdjustCommand): Promise<{
    ajuste: AjusteManual;
    alerta: boolean;
    mensajeAlerta?: string;
  }> {
    const { dto, usuarioId, usuarioRol } = command;

    if (usuarioRol !== 'DUENO') {
      throw new ForbiddenException(
        'Solo el due�o puede realizar ajustes manuales de inventario',
      );
    }

    if (dto.nuevaCantidad < 0) {
      throw new DomainError(
        'La cantidad nueva no puede ser negativa',
        'CANTIDAD_INVALIDA',
      );
    }

    const stockActual = await this.ajusteRepo.getStockActual(dto.varianteId);

    if (stockActual === null) {
      throw new DomainError(
        `Variante ${dto.varianteId} no encontrada`,
        'VARIANTE_NO_ENCONTRADA',
      );
    }

    const diferencia = dto.nuevaCantidad - stockActual;

    await this.ajusteRepo.actualizarStock(dto.varianteId, dto.nuevaCantidad);

    const ajuste = await this.ajusteRepo.registrarAjuste({
      varianteId: dto.varianteId,
      usuarioId,
      cantidadAnterior: stockActual,
      cantidadNueva: dto.nuevaCantidad,
      diferencia,
      motivo: dto.motivo,
    });

    const alerta = Math.abs(diferencia) >= UMBRAL_ALERTA_UNIDADES;

    return {
      ajuste,
      alerta,
      mensajeAlerta: alerta
        ? `?? Ajuste significativo: diferencia de ${diferencia > 0 ? '+' : ''}${diferencia} unidades supera umbral de ${UMBRAL_ALERTA_UNIDADES}`
        : undefined,
    };
  }
}



