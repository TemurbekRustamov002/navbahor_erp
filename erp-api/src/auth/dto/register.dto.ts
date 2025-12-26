import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsEmail, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Foydalanuvchi nomi (username)',
    example: 'john_doe',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'Username kamida 3 ta belgidan iborat bo\'lishi kerak' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username faqat harflar, raqamlar va pastki chiziqdan (_) iborat bo\'lishi kerak'
  })
  username: string;

  @ApiProperty({
    description: 'Email manzil',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Noto\'g\'ri email format' })
  email: string;

  @ApiProperty({
    description: 'To\'liq ism',
    example: 'John Doe',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'To\'liq ism kamida 2 ta belgidan iborat bo\'lishi kerak' })
  fullName: string;

  @ApiProperty({
    description: 'Parol',
    example: 'SecurePass123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' })
  password: string;
}