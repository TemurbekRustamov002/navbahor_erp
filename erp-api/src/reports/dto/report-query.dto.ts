import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { ProductType, ToyStatus, LabGrade } from '@prisma/client';

export class ReportQueryDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsEnum(ProductType)
    productType?: ProductType;

    @IsOptional()
    @IsString()
    markaId?: string;

    @IsOptional()
    @IsEnum(ToyStatus)
    status?: ToyStatus;

    @IsOptional()
    @IsEnum(LabGrade)
    grade?: LabGrade;
}
