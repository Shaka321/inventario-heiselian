import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { I_DEVOLUCION_REPOSITORY } from '../repositories/devolucion.repository.interface';
import type { IDevolucionRepository, Devolucion } from '../repositories/devolucion.repository.interface';
import { RegisterReturnDto } from '../dtos';
import { DomainError } from '../../../domain/errors/domain.error';

export interface RegisterReturnCommand {
  dto: RegisterReturnDto;
  usuarioId: string;
}

@Injectable()
export class RegisterReturnUseCase {
  constructor(
    @Inject(I_DEVOLUCION_REPOSITORY)
    private readonly devolucionRepo: IDevolucionRepository,
  ) {}

  async execute(command: RegisterReturnCommand): Promise<Devolucion> {
    const { dto, usuarioId } = command;

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException(
        'La devoluci�n debe incluir al menos un item',
      );
    }

    const venta = await this.devolucionRepo.getVentaConItems(dto.ventaId);
    if (!venta) {
      throw new NotFoundException(`Venta ${dto.ventaId} no encontrada`);
    }

    if (venta.estado === 'CANCELADA') {
      throw new DomainError(
        'No se puede devolver una venta cancelada',
        'VENTA_CANCELADA',
      );
    }

    const devolucionesExistentes = await this.devolucionRepo.findByVentaId(
      dto.ventaId,
    );
    const aprobadas = devolucionesExistentes.filter(
      (d) => d.estado === 'APROBADA',
    );
    if (aprobadas.length > 0) {
      throw new DomainError(
        'Esta venta ya tiene una devoluci�n aprobada',
        'DEVOLUCION_DUPLICADA',
      );
    }

    for (const item of dto.items) {
      const itemVenta = venta.items.find(
        (i) => i.varianteId === item.varianteId,
      );
      if (!itemVenta) {
        throw new DomainError(
          `La variante ${item.varianteId} no pertenece a la venta ${dto.ventaId}`,
          'VARIANTE_NO_EN_VENTA',
        );
      }
      if (item.cantidad > itemVenta.cantidad) {
        throw new DomainError(
          `No se puede devolver ${item.cantidad} unidades de variante ${item.varianteId}, solo se vendieron ${itemVenta.cantidad}`,
          'CANTIDAD_DEVOLUCION_EXCEDE_VENTA',
        );
      }
    }

    const itemsConPrecio = dto.items.map((item) => {
      const itemVenta = venta.items.find(
        (i) => i.varianteId === item.varianteId,
      )!;
      return {
        varianteId: item.varianteId,
        cantidad: item.cantidad,
        precioUnitario: itemVenta.precioUnitario,
      };
    });

    return this.devolucionRepo.crear({
      ventaId: dto.ventaId,
      usuarioId,
      motivo: dto.motivo,
      items: itemsConPrecio,
    });
  }
}



