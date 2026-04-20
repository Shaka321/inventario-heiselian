import { Module } from '@nestjs/common';
import { AuditoriaController } from './auditoria.controller';
import { GetAuditLogUseCase } from './use-cases/get-audit-log.use-case';
import { ExportAuditLogUseCase } from './use-cases/export-audit-log.use-case';
import { VerifyChecksumsUseCase } from './use-cases/verify-checksums.use-case';
import { PrismaAuditoriaRepository } from './infrastructure/prisma-auditoria.repository';
import { I_AUDITORIA_REPOSITORY } from './repositories/auditoria.repository.interface';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [AuditoriaController],
  providers: [
    PrismaService,
    GetAuditLogUseCase,
    ExportAuditLogUseCase,
    VerifyChecksumsUseCase,
    { provide: I_AUDITORIA_REPOSITORY, useClass: PrismaAuditoriaRepository },
  ],
})
export class AuditoriaModule {}
