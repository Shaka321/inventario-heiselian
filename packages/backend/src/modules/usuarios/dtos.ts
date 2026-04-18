import { IsEmail, IsString, MinLength, MaxLength, IsIn, IsOptional } from 'class-validator';

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'Email invalido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password minimo 6 caracteres' })
  @MaxLength(100)
  password: string;

  @IsIn(['DUENO', 'SUPERVISOR', 'EMPLEADO'], { message: 'Rol invalido' })
  rol: string;
}

export class UpdateUsuarioDto {
  @IsOptional()
  @IsIn(['DUENO', 'SUPERVISOR', 'EMPLEADO'], { message: 'Rol invalido' })
  rol?: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  passwordActual: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  passwordNuevo: string;
}
