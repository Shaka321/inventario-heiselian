import { IsUUID, IsNumber, Min } from 'class-validator';

export class UpdatePriceDto {
  @IsUUID('4', { message: 'varianteId debe ser un UUID valido' })
  varianteId: string;

  @IsNumber({}, { message: 'nuevoPrecio debe ser un numero' })
  @Min(0, { message: 'nuevoPrecio no puede ser negativo' })
  nuevoPrecio: number;
}
