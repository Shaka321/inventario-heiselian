import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { RegisterSaleDto } from '../dtos';
import * as crypto from 'crypto';

export class StockInsuficienteError extends BadRequestException {
  constructor(sku: string, disponible: number, solicitado: number) {
    super(`Stock insuficiente para SKU ${sku}: disponible ${disponible}, solicitado ${solicitado}`);
  }
}

@Injectable()
export class RegisterSaleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: RegisterSaleDto, usuarioId: string): Promise<{ id: string; total: number }> {
    const ventaId = crypto.randomUUID();
    const ahora = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Adquirir lock pesimista en variantes involucradas
      const varianteIds = dto.items.map((i) => i.varianteId);
      const variantes = await tx.$queryRawUnsafe<Array<{
        id: string;
        sku: string;
        precio: number;
        stock: number;
        activo: boolean;
      }>>(
        `SELECT id, sku, precio::float, stock, activo
         FROM variantes
         WHERE id = ANY($1::uuid[])
         ORDER BY id
         FOR UPDATE`,
        varianteIds,
      );

      if (variantes.length !== varianteIds.length) {
        throw new BadRequestException('Una o mas variantes no encontradas');
      }

      // 2. Validar stock y construir items con precio snapshot
      const varianteMap = new Map(variantes.map((v) => [v.id, v]));
      let total = 0;
      const itemsConSnapshot: Array<{
        id: string;
        ventaId: string;
        varianteId: string;
        cantidad: number;
        precioSnapshot: number;
      }> = [];

      for (const item of dto.items) {
        const variante = varianteMap.get(item.varianteId);
        if (!variante || !variante.activo) {
          throw new BadRequestException(`Variante ${item.varianteId} no activa`);
        }
        if (variante.stock < item.cantidad) {
          throw new StockInsuficienteError(variante.sku, variante.stock, item.cantidad);
        }
        const precioSnapshot = Number(variante.precio);
        total += precioSnapshot * item.cantidad;
        itemsConSnapshot.push({
          id: crypto.randomUUID(),
          ventaId,
          varianteId: item.varianteId,
          cantidad: item.cantidad,
          precioSnapshot,
        });
      }

      // 3. Decrementar stock de cada variante
      for (const item of dto.items) {
        await tx.variante.update({
          where: { id: item.varianteId },
          data: { stock: { decrement: item.cantidad } },
        });
      }

      // 4. Crear la venta
      await tx.venta.create({
        data: {
          id: ventaId,
          usuarioId,
          total,
          metodoPago: dto.metodoPago as any,
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

      // 5. Crear AuditLog con checksum HMAC-SHA256
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
