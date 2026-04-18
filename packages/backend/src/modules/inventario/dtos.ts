import { IsUUID, IsNumber, IsInt, Min } from 'class-validator';

export class RegisterPurchaseDto {
  @IsUUID('4', { message: 'varianteId debe ser un UUID valido' })
  varianteId: string;

  @IsUUID('4', { message: 'proveedorId debe ser un UUID valido' })
  proveedorId: string;

  @IsInt({ message: 'cantidadUnidades debe ser un entero' })
  @Min(1, { message: 'cantidadUnidades minimo 1' })
  cantidadUnidades: number;

  @IsNumber({}, { message: 'costoUnitario debe ser un numero' })
  @Min(0, { message: 'costoUnitario no puede ser negativo' })
  costoUnitario: number;
}

export class AdjustStockDto {
  @IsUUID('4', { message: 'varianteId debe ser un UUID valido' })
  varianteId: string;

  @IsInt({ message: 'nuevoStock debe ser un entero' })
  @Min(0, { message: 'nuevoStock no puede ser negativo' })
  nuevoStock: number;

  @IsUUID('4', { message: 'usuarioId debe ser un UUID valido' })
  usuarioId: string;
}
