import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class CancelSaleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(ventaId: string, usuarioId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const venta = await tx.venta.findUnique({
        where: { id: ventaId },
        include: { items: true },
      });

      if (!venta) {
        throw new NotFoundException('Venta no encontrada');
      }

      if (venta.estado === 'ANULADA') {
        throw new BadRequestException('La venta ya esta anulada');
      }

      // Revertir stock de cada item
      for (const item of venta.items) {
        await tx.variante.update({
          where: { id: item.varianteId },
          data: { stock: { increment: item.cantidad } },
        });
      }

      // Marcar venta como anulada
      await tx.venta.update({
        where: { id: ventaId },
        data: { estado: 'ANULADA' },
      });

      // AuditLog de anulacion
      const payload = {
        ventaId,
        usuarioId,
        timestamp: new Date().toISOString(),
      };
      const secret = process.env.AUDIT_HMAC_SECRET ?? 'audit-secret-dev';
      const checksum = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      await tx.auditLog.create({
        data: {
          id: crypto.randomUUID(),
          usuarioId,
          tipoEvento: 'VENTA_ANULADA',
          payload,
          checksum,
          creadoEn: new Date(),
        },
      });
    });
  }
}
