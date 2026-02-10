import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google ID token' })
  @IsString()
  idToken: string;
}

export class AppleAuthDto {
  @ApiProperty({ description: 'Apple identity token' })
  @IsString()
  identityToken: string;

  @ApiProperty({ description: 'User full name (optional, only on first sign-in)', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;
}
