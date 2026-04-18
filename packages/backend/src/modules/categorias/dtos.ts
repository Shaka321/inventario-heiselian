import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @MinLength(2, { message: 'Nombre minimo 2 caracteres' })
  @MaxLength(100, { message: 'Nombre maximo 100 caracteres' })
  nombre: string;
}

export class UpdateCategoriaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
