import {
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  Min
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType } from '@prisma/client';

export class CreateToyDto {
  @ApiProperty({ description: 'Marka ID' })
  @IsString()
  markaId: string;

  @ApiProperty({ description: 'Product type', enum: ProductType })
  productType: ProductType;

  @ApiProperty({ description: 'Brutto weight' })
  @IsNumber()
  @Min(0)
  brutto: number;

  @ApiProperty({ description: 'Tara weight' })
  @IsNumber()
  @Min(0)
  tara: number;

  @ApiProperty({ description: 'Netto weight' })
  @IsNumber()
  @Min(0)
  netto: number;

  @ApiPropertyOptional({ description: 'Order number (auto-generated if not provided)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  orderNo?: number;

  @ApiPropertyOptional({ description: 'Operator ID' })
  @IsString()
  operatorId?: string;

  @ApiPropertyOptional({ description: 'Production brigade/shift' })
  @IsOptional()
  @IsString()
  brigade?: string;
}

export class UpdateToyDto {
  @ApiPropertyOptional({ description: 'Brutto weight' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  brutto?: number;

  @ApiPropertyOptional({ description: 'Tara weight' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tara?: number;

  @ApiPropertyOptional({ description: 'Netto weight' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  netto?: number;

  @ApiPropertyOptional({ description: 'Printed status' })
  @IsOptional()
  printed?: boolean;

  @ApiPropertyOptional({ description: 'Production brigade/shift' })
  @IsOptional()
  @IsString()
  brigade?: string;
}

export class ToyQueryDto {
  @ApiPropertyOptional({ description: 'Marka ID' })
  @IsOptional()
  @IsString()
  markaId?: string;

  @ApiPropertyOptional({ description: 'Product type', enum: ProductType })
  @IsOptional()
  productType?: ProductType;

  @ApiPropertyOptional({ description: 'Lab status' })
  @IsOptional()
  @IsString()
  labStatus?: string;

  @ApiPropertyOptional({ description: 'Production brigade/shift' })
  @IsOptional()
  @IsString()
  brigade?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 50;
}