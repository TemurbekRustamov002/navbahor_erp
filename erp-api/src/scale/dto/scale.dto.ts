import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsUUID, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MarkaDepartment } from '@prisma/client';

export class CreateScaleDto {
  @ApiProperty({ description: 'Scale name (e.g., CAS_CI_200A, BAYKON_BX65)' })
  @IsString()
  name: string;

  @ApiProperty({ enum: MarkaDepartment, description: 'Department this scale belongs to' })
  @IsEnum(MarkaDepartment)
  department: MarkaDepartment;

  @ApiPropertyOptional({ description: 'Whether scale is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Scale-specific settings', type: 'object', additionalProperties: true })
  @IsOptional()
  settings?: any;
}

export class UpdateScaleConfigDto {
  @ApiPropertyOptional({ description: 'Scale name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: MarkaDepartment, description: 'Department' })
  @IsOptional()
  @IsEnum(MarkaDepartment)
  department?: MarkaDepartment;

  @ApiPropertyOptional({ description: 'Whether scale is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ 
    description: 'Connection status', 
    enum: ['connected', 'disconnected', 'error'] 
  })
  @IsOptional()
  @IsString()
  connectionStatus?: string;

  @ApiPropertyOptional({ description: 'Scale settings', type: 'object', additionalProperties: true })
  @IsOptional()
  settings?: any;
}

export class ScaleReadingDto {
  @ApiProperty({ description: 'Weight reading in kg', example: 185.5 })
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(1000)
  @Transform(({ value }) => parseFloat(value))
  weight: number;

  @ApiPropertyOptional({ description: 'Whether reading is stable', default: false })
  @IsOptional()
  @IsBoolean()
  isStable?: boolean;

  @ApiPropertyOptional({ description: 'Weight unit', default: 'kg' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Associated marka ID' })
  @IsOptional()
  @IsUUID()
  markaId?: string;

  @ApiPropertyOptional({ description: 'Scale session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class StartScaleSessionDto {
  @ApiProperty({ description: 'Unique session identifier' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: 'Associated marka ID' })
  @IsOptional()
  @IsUUID()
  markaId?: string;
}

export class ScaleStatusDto {
  @ApiProperty({ description: 'Scale ID' })
  scaleId: string;

  @ApiProperty({ description: 'Scale name' })
  scaleName: string;

  @ApiProperty({ description: 'Department' })
  department: MarkaDepartment;

  @ApiProperty({ description: 'Connection status' })
  connectionStatus: string;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Last heartbeat' })
  lastHeartbeat?: Date;

  @ApiProperty({ description: 'Latest weight reading' })
  latestWeight?: number;

  @ApiProperty({ description: 'Is stable reading' })
  isStable?: boolean;
}

export class DepartmentScalesDto {
  @ApiProperty({ enum: MarkaDepartment, description: 'Department' })
  @IsEnum(MarkaDepartment)
  department: MarkaDepartment;

  @ApiProperty({ description: 'Available scales', type: [ScaleStatusDto] })
  scales: ScaleStatusDto[];

  @ApiProperty({ description: 'Active markas for this department' })
  activeMarkas: any[];

  @ApiProperty({ description: 'Department information' })
  departmentInfo: {
    department: MarkaDepartment;
    scaleCount: number;
    markaCount: number;
  };
}

export class WebSocketScaleDto {
  @ApiProperty({ description: 'Event type' })
  event: 'reading' | 'status' | 'error' | 'session_start' | 'session_end';

  @ApiProperty({ description: 'Scale ID' })
  scaleId: string;

  @ApiProperty({ description: 'Event data', type: 'object', additionalProperties: true })
  data: any;

  @ApiProperty({ description: 'Timestamp' })
  timestamp: Date;
}