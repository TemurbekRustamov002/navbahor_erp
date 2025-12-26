import { IsString, IsOptional, IsUUID, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShipmentDriverDto {
  @ApiProperty({ description: 'Driver first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Driver last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Driver license number' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ description: 'Driver phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Vehicle registration number' })
  @IsString()
  vehicleNumber: string;

  @ApiProperty({ description: 'Vehicle type', default: 'Yuk mashinasi' })
  @IsString()
  vehicleType: string;
}

export class CreateShipmentDocumentsDto {
  @ApiProperty({ description: 'Waybill document prepared' })
  @IsOptional()
  waybill: boolean;

  @ApiProperty({ description: 'Invoice document prepared' })
  @IsOptional()
  invoice: boolean;

  @ApiProperty({ description: 'Packing list prepared' })
  @IsOptional()
  packing: boolean;

  @ApiProperty({ description: 'Quality certificate prepared' })
  @IsOptional()
  quality: boolean;
}

export class CreateShipmentDto {
  @ApiProperty({ description: 'Order ID' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: 'Checklist ID' })
  @IsUUID()
  checklistId: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  customerName: string;

  @ApiProperty({ description: 'Driver information' })
  @ValidateNested()
  @Type(() => CreateShipmentDriverDto)
  driver: CreateShipmentDriverDto;

  @ApiProperty({ description: 'Waybill number' })
  @IsString()
  waybillNumber: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Total items count' })
  @IsOptional()
  totalItems: number;

  @ApiProperty({ description: 'Total weight in kg' })
  @IsOptional()
  totalWeight: number;

  @ApiProperty({ description: 'Documents status' })
  @ValidateNested()
  @Type(() => CreateShipmentDocumentsDto)
  documents: CreateShipmentDocumentsDto;

  @ApiProperty({ description: 'Shipped by user ID' })
  @IsString()
  shippedBy: string;

  @ApiProperty({ description: 'Planned delivery date', required: false })
  @IsOptional()
  @IsDateString()
  plannedDeliveryDate?: string;
}