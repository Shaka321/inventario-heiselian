import { Injectable, Inject } from '@nestjs/common';
import { I_AUDITORIA_REPOSITORY } from '../repositories/auditoria.repository.interface';
import type { IAuditoriaRepository, AuditLogEntry } from '../repositories/auditoria.repository.interface';
import * as crypto from 'crypto';

const HMAC_SECRET =
  process.env.AUDIT_HMAC_SECRET ?? 'default-secret-change-in-production';

export interface ChecksumVerificationResult {
  total: number;
  validos: number;
  invalidos: number;
  registrosCorruptos: {
    id: string;
    entidad: string;
    accion: string;
    creadoEn: Date;
  }[];
  integridadOk: boolean;
}

@Injectable()
export class VerifyChecksumsUseCase {
  constructor(
    @Inject(I_AUDITORIA_REPOSITORY)
    private readonly auditoriaRepo: IAuditoriaRepository,
  ) {}

  async execute(): Promise<ChecksumVerificationResult> {
    const registros = await this.auditoriaRepo.findAll();
    const corruptos: {
      id: string;
      entidad: string;
      accion: string;
      creadoEn: Date;
    }[] = [];

    for (const registro of registros) {
      const checksumCalculado = this.calcularChecksum(registro);
      if (checksumCalculado !== registro.checksum) {
        corruptos.push({
          id: registro.id,
          entidad: registro.entidad,
          accion: registro.accion,
          creadoEn: registro.creadoEn,
        });
      }
    }

    return {
      total: registros.length,
      validos: registros.length - corruptos.length,
      invalidos: corruptos.length,
      registrosCorruptos: corruptos,
      integridadOk: corruptos.length === 0,
    };
  }

  private calcularChecksum(registro: AuditLogEntry): string {
    const data = `${registro.entidad}:${registro.entidadId}:${registro.accion}:${registro.usuarioId}:${JSON.stringify(registro.payload)}:${registro.creadoEn.toISOString()}`;
    return crypto.createHmac('sha256', HMAC_SECRET).update(data).digest('hex');
  }
}



