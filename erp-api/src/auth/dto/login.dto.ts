import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Foydalanuvchi nomi (username)',
    example: 'admin',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'Username kamida 3 ta belgidan iborat bo\'lishi kerak' })
  username: string;

  @ApiProperty({
    description: 'Foydalanuvchi paroli',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' })
  password: string;
}