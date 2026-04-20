import {
  IsString,
  IsArray,
  IsInt,
  IsPositive,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { EstadoDevolucion } from './repositories/devolucion.repository.interface';

export class DevolucionItemDto {
  @IsString()
  varianteId: string;

  @IsInt()
  @IsPositive()
  cantidad: number;
}

export class RegisterReturnDto {
  @IsString()
  ventaId: string;

  @IsString()
  @MinLength(5)
  @MaxLength(500)
  motivo: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DevolucionItemDto)
  items: DevolucionItemDto[];
}

export class ApproveRejectReturnDto {
  @IsString()
  id: string;
}

export class ListDevolucionesDto {
  @IsOptional()
  @IsEnum(['PENDIENTE', 'APROBADA', 'RECHAZADA'])
  estado?: EstadoDevolucion;

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
  limit?: number = 20;
}

