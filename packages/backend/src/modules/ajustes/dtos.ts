import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  MaxLength,
  MinLength,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterManualAdjustDto {
  @IsString()
  varianteId: string;

  @IsInt()
  @IsNumber()
  nuevaCantidad: number;

  @IsString()
  @MinLength(5, { message: 'Motivo debe tener al menos 5 caracteres' })
  @MaxLength(500)
  motivo: string;
}

export class ListAdjustmentsDto {
  @IsOptional()
  @IsString()
  varianteId?: string;

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
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
