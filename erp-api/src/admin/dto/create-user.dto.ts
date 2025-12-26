import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'new_user' })
  @IsString()
  username!: string;

  @ApiProperty({ example: 'new_user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'New User Fullname' })
  @IsString()
  fullName!: string;

  @ApiProperty({ enum: Role, example: Role.WAREHOUSE })
  @IsEnum(Role)
  role!: Role;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ required: false, example: 'password123' })
  @IsOptional()
  @IsString()
  confirmPassword?: string;
}
