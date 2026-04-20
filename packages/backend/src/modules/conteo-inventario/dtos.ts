import {
  IsArray,
  IsString,
  IsInt,
  IsPositive,
  IsOptional,
  IsBoolean,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StartBlindCountDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  varianteIds: string[];

  @IsOptional()
  @IsString()
  notas?: string;
}

export class ConteoItemSubmitDto {
  @IsString()
  varianteId: string;

  @IsInt()
  @IsPositive()
  cantidadContada: number;
}

export class SubmitEmployeeCountDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ConteoItemSubmitDto)
  items: ConteoItemSubmitDto[];
}

export class ResolveDiscrepancyDto {
  @IsBoolean()
  aplicarAjuste: boolean;
}
