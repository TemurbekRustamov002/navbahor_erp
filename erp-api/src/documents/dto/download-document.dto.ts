import { IsString, IsOptional, IsObject } from 'class-validator';

export class DownloadDocumentDto {
  @IsString()
  documentId: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  markaId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}