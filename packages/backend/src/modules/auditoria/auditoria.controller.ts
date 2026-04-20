import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { GetAuditLogUseCase } from './use-cases/get-audit-log.use-case';
import { ExportAuditLogUseCase } from './use-cases/export-audit-log.use-case';
import { VerifyChecksumsUseCase } from './use-cases/verify-checksums.use-case';
import { GetAuditLogDto, ExportAuditLogDto } from './dtos';

@Controller('auditoria')
@UseGuards(JwtAuthGuard)
export class AuditoriaController {
  constructor(
    private readonly getAuditLog: GetAuditLogUseCase,
    private readonly exportAuditLog: ExportAuditLogUseCase,
    private readonly verifyChecksums: VerifyChecksumsUseCase,
  ) {}

  @Get()
  async listar(@Query() query: GetAuditLogDto, @Request() req: any) {
    if (req.user.rol !== 'DUENO') {
      throw new ForbiddenException('Solo el due�o puede ver el audit log');
    }
    return this.getAuditLog.execute(query);
  }

  @Get('export')
  async exportar(
    @Query() query: ExportAuditLogDto,
    @Res() res: Response,
    @Request() req: any,
  ) {
    if (req.user.rol !== 'DUENO') {
      throw new ForbiddenException('Solo el due�o puede exportar el audit log');
    }
    const csv = await this.exportAuditLog.execute(query);
    const fecha = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="auditlog-${fecha}.csv"`,
    );
    res.send(csv);
  }

  @Get('verify')
  async verificar(@Request() req: any) {
    if (req.user.rol !== 'DUENO') {
      throw new ForbiddenException('Solo el due�o puede verificar checksums');
    }
    return this.verifyChecksums.execute();
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: any) {
    if (req.user.rol !== 'DUENO') {
      throw new ForbiddenException('Solo el due�o puede ver el audit log');
    }
    return this.getAuditLog.execute({ page: 1, limit: 1 });
  }
}

