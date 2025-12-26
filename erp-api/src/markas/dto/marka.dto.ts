import { 
  IsString, 
  IsEnum, 
  IsInt, 
  IsOptional, 
  IsBoolean, 
  Min, 
  Max 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ProductType, MarkaStatus, SexType, MarkaDepartment } from '@prisma/client';

export class CreateMarkaDto {
  @ApiProperty({ description: 'Marka raqami', example: 1 })
  @IsInt()
  @Min(1, { message: 'Marka raqami 1 dan kichik bo\'lmasligi kerak' })
  @Max(9999, { message: 'Marka raqami 9999 dan katta bo\'lmasligi kerak' })
  number: number;

  @ApiProperty({ 
    description: 'Product type', 
    enum: ProductType,
    example: ProductType.TOLA 
  })
  @IsEnum(ProductType)
  productType: ProductType;

  @ApiProperty({ description: 'Selection variety', example: 'S-6524' })
  @IsString()
  selection: string;

  @ApiProperty({ description: 'PTM value', example: '4.2' })
  @IsString()
  ptm: string;

  @ApiProperty({ description: 'Picking type', example: 'qol' })
  @IsString()
  pickingType: string;

  @ApiPropertyOptional({ 
    description: 'Sex (required for TOLA only)', 
    enum: SexType,
    example: SexType.VALIKLI 
  })
  @IsOptional()
  @IsEnum(SexType)
  sex?: SexType;

  @ApiPropertyOptional({ description: 'Capacity (default: 220 toys)', example: 220, default: 220 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ description: 'Show on scale', example: true, default: false })
  @IsOptional()
  @IsBoolean()
  showOnScale?: boolean;
}

export class UpdateMarkaDto {
  @ApiPropertyOptional({ description: 'Product type', enum: ProductType })
  @IsOptional()
  @IsEnum(ProductType)
  productType?: ProductType;

  @ApiPropertyOptional({ description: 'Sex (ARRALI/VALIKLI/UNIVERSAL)', enum: SexType })
  @IsOptional()
  @IsEnum(SexType)
  sex?: SexType;

  @ApiPropertyOptional({ description: 'Selection variety' })
  @IsOptional()
  @IsString()
  selection?: string;

  @ApiPropertyOptional({ description: 'PTM value' })
  @IsOptional()
  @IsString()
  ptm?: string;

  @ApiPropertyOptional({ description: 'Marka status', enum: MarkaStatus })
  @IsOptional()
  @IsEnum(MarkaStatus)
  status?: MarkaStatus;

  @ApiPropertyOptional({ description: 'Show on scale' })
  @IsOptional()
  @IsBoolean()
  showOnScale?: boolean;

  @ApiPropertyOptional({ description: 'Picking type' })
  @IsOptional()
  @IsString()
  pickingType?: string;

  @ApiPropertyOptional({ description: 'Capacity' })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ description: 'Used amount' })
  @IsOptional()
  @IsInt()
  @Min(0)
  used?: number;

  @ApiPropertyOptional({ description: 'Notes/Comments' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class MarkaQueryDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search by number, selection, or PTM' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by product type', enum: ProductType })
  @IsOptional()
  @IsEnum(ProductType)
  productType?: ProductType;

  @ApiPropertyOptional({ description: 'Filter by sex', enum: SexType })
  @IsOptional()
  @IsEnum(SexType)
  sex?: SexType;

  @ApiPropertyOptional({ description: 'Filter by department', enum: MarkaDepartment })
  @IsOptional()
  @IsEnum(MarkaDepartment)
  department?: MarkaDepartment;

  @ApiPropertyOptional({ description: 'Filter by status', enum: MarkaStatus })
  @IsOptional()
  @IsEnum(MarkaStatus)
  status?: MarkaStatus;

  @ApiPropertyOptional({ description: 'Filter by scale visibility' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  showOnScale?: boolean;

  @ApiPropertyOptional({ description: 'Filter markas with untested toys (for lab form)' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  withUntestedToys?: boolean;

  @ApiPropertyOptional({ description: 'Sort by field', example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', example: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
