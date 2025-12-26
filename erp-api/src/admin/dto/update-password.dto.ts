import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'newStrongPass123' })
  @IsString()
  @MinLength(6)
  password!: string;
}
