import {
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetAuditLogDto {
  @IsOptional()
  @IsString()
  entidad?: string;

  @IsOptional()
  @IsString()
  accion?: string;

  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 50;
}

export class ExportAuditLogDto {
  @IsOptional()
  @IsString()
  entidad?: string;

  @IsOptional()
  @IsString()
  accion?: string;

  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;
}
