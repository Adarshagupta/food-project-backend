import { IsNumber, IsOptional, Min, Max, IsString, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FindNearbyDto {
  @ApiProperty({ example: 40.7128, description: 'Latitude', required: false })
  @IsOptional()
  @ValidateIf(o => !o.postcode)
  @IsNumber()
  @Type(() => Number)
  lat?: number;

  @ApiProperty({ example: -74.006, description: 'Longitude', required: false })
  @IsOptional()
  @ValidateIf(o => !o.postcode)
  @IsNumber()
  @Type(() => Number)
  lng?: number;

  @ApiProperty({ example: 5, description: 'Radius in kilometers', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(50)
  @Type(() => Number)
  radius?: number;

  @ApiProperty({ example: '522503', description: 'Postal/ZIP code', required: false })
  @IsOptional()
  @ValidateIf(o => !o.lat && !o.lng)
  @IsString()
  postcode?: string;
}
