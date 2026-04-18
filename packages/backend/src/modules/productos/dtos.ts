import { IsString, MinLength, MaxLength, IsUUID, IsOptional } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @MinLength(2, { message: 'Nombre minimo 2 caracteres' })
  @MaxLength(150, { message: 'Nombre maximo 150 caracteres' })
  nombre: string;

  @IsUUID('4', { message: 'categoriaId debe ser un UUID valido' })
  categoriaId: string;
}

export class UpdateProductoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nombre?: string;

  @IsOptional()
  @IsUUID('4')
  categoriaId?: string;
}
