import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email invalido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password minimo 6 caracteres' })
  @MaxLength(100)
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  rol: string;
  iat?: number;
  exp?: number;
}
