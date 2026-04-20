import {
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { EstadoCaja } from './repositories/cierre-caja.repository.interface';

export class OpenCashRegisterDto {
  @IsNumber()
  @Min(0)
  montoInicial: number;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class CloseCashRegisterDto {
  @IsNumber()
  @Min(0)
  montoFinal: number;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class GetCashRegisterHistoryDto {
  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @IsEnum(['ABIERTA', 'CERRADA'])
  estado?: EstadoCaja;

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

