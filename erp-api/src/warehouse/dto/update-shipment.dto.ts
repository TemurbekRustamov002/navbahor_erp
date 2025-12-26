import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ShipmentStatus {
  PENDING = 'pending',
  PREPARING = 'preparing', 
  READY = 'ready',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export class UpdateShipmentStatusDto {
  @ApiProperty({ description: 'New shipment status', enum: ShipmentStatus })
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

  @ApiProperty({ description: 'Status update notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompleteShipmentDto {
  @ApiProperty({ description: 'Actual delivery date', required: false })
  @IsOptional()
  @IsDateString()
  deliveredAt?: string;

  @ApiProperty({ description: 'Delivery confirmation notes', required: false })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;

  @ApiProperty({ description: 'Recipient name', required: false })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiProperty({ description: 'Recipient signature', required: false })
  @IsOptional()
  @IsString()
  recipientSignature?: string;
}