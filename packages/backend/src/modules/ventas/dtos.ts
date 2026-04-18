import { IsUUID, IsIn, IsArray, ValidateNested, IsInt, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class VentaItemDto {
  @IsUUID('4', { message: 'varianteId debe ser un UUID valido' })
  varianteId: string;

  @IsInt({ message: 'cantidad debe ser un entero' })
  @Min(1, { message: 'cantidad minimo 1' })
  cantidad: number;
}

export class RegisterSaleDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un item' })
  @ValidateNested({ each: true })
  @Type(() => VentaItemDto)
  items: VentaItemDto[];

  @IsIn(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'QR'], { message: 'Metodo de pago invalido' })
  metodoPago: string;
}

export class CancelSaleDto {
  @IsUUID('4', { message: 'ventaId debe ser un UUID valido' })
  ventaId: string;
}
