import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { RegisterSaleDto } from '../dtos';
import * as crypto from 'crypto';

interface VarianteRaw {
  id: string;
  sku: string;
  precio: number;
  stock: number;
  activo: boolean;
}

export class StockInsuficienteError extends BadRequestException {
  constructor(sku: string, disponible: number, solicitado: number) {
    super(
      `Stock insuficiente para SKU ${sku}: disponible ${disponible}, solicitado ${solicitado}`,
    );
  }
}

@Injectable()
export class RegisterSaleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dto: RegisterSaleDto,
    usuarioId: string,
  ): Promise<{ id: string; total: number }> {
    const ventaId = crypto.randomUUID();
    const ahora = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      const varianteIds = dto.items.map((i) => i.varianteId);

      const variantes = await tx.$queryRaw<VarianteRaw[]>`
        SELECT id::text, sku, precio::float8 as precio, stock, activo
        FROM variantes
        WHERE id = ANY(${varianteIds}::uuid[])
        ORDER BY id
        FOR UPDATE
      `;

      if (variantes.length !== varianteIds.length) {
        throw new BadRequestException('Una o mas variantes no encontradas');
      }

      const varianteEntries: Array<[string, VarianteRaw]> = variantes.map(
        (v) => [v.id, v],
      );
      const varianteMap = new Map<string, VarianteRaw>(varianteEntries);
      let total = 0;
      const itemsConSnapshot: Array<{
        id: string;
        varianteId: string;
        cantidad: number;
        precioSnapshot: number;
      }> = [];

      for (const item of dto.items) {
        const variante = varianteMap.get(item.varianteId);
        if (!variante || !variante.activo) {
          throw new BadRequestException(
            `Variante ${item.varianteId} no activa`,
          );
        }
        if (variante.stock < item.cantidad) {
          throw new StockInsuficienteError(
            variante.sku,
            variante.stock,
            item.cantidad,
          );
        }
        const precioSnapshot = Number(variante.precio);
        total += precioSnapshot * item.cantidad;
        itemsConSnapshot.push({
          id: crypto.randomUUID(),
          varianteId: item.varianteId,
          cantidad: item.cantidad,
          precioSnapshot,
        });
      }

      for (const item of dto.items) {
        await tx.variante.update({
          where: { id: item.varianteId },
          data: { stock: { decrement: item.cantidad } },
        });
      }

      await tx.venta.create({
        data: {
          id: ventaId,
          usuarioId,
          total,
          metodoPago: dto.metodoPago as
            | 'EFECTIVO'
            | 'TARJETA'
            | 'TRANSFERENCIA'
            | 'QR',
          estado: 'COMPLETADA',
          creadoEn: ahora,
          items: {
            create: itemsConSnapshot.map((i) => ({
              id: i.id,
              varianteId: i.varianteId,
              cantidad: i.cantidad,
              precioSnapshot: i.precioSnapshot,
            })),
          },
        },
      });

      const payload = {
        ventaId,
        usuarioId,
        total,
        metodoPago: dto.metodoPago,
        items: itemsConSnapshot.map((i) => ({
          varianteId: i.varianteId,
          cantidad: i.cantidad,
          precioSnapshot: i.precioSnapshot,
        })),
        timestamp: ahora.toISOString(),
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
          tipoEvento: 'VENTA_CREADA',
          payload,
          checksum,
          creadoEn: ahora,
        },
      });

      return { id: ventaId, total };
    });

    return result;
  }
}
