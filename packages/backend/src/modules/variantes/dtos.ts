import { IsString, MinLength, MaxLength, IsUUID, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateVarianteDto {
  @IsUUID('4', { message: 'productoId debe ser un UUID valido' })
  productoId: string;

  @IsString()
  @MinLength(2, { message: 'SKU minimo 2 caracteres' })
  @MaxLength(50, { message: 'SKU maximo 50 caracteres' })
  sku: string;

  @IsNumber({}, { message: 'Precio debe ser un numero' })
  @Min(0, { message: 'Precio no puede ser negativo' })
  precio: number;

  @IsNumber({}, { message: 'Costo debe ser un numero' })
  @Min(0, { message: 'Costo no puede ser negativo' })
  costo: number;

  @IsNumber()
  @Min(0)
  stock: number;
}

export class UpdateVarianteDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  sku?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costo?: number;
}
