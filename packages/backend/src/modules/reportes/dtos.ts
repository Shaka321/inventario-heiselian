import {
  IsDateString,
  IsOptional,
  IsEnum,
  IsInt,
  IsPositive,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PeriodFilterDto {
  @IsDateString()
  desde: string;

  @IsDateString()
  hasta: string;
}

export class SalesByPeriodDto extends PeriodFilterDto {
  @IsOptional()
  @IsEnum(['dia', 'semana', 'mes'])
  agruparPor?: 'dia' | 'semana' | 'mes' = 'dia';
}

export class TopSellingDto extends PeriodFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 10;
}

export class CriticalStockDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  umbralMinimo?: number = 5;
}
