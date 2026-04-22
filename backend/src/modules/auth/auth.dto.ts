import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Kayıt DTO / Registration DTO
 */
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(6)
  password: string;
}

/**
 * Giriş DTO / Login DTO
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

/**
 * Auth Cevap DTO / Auth Response DTO
 */
export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
