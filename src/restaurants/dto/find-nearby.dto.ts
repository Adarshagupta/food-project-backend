import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FindNearbyDto {
  @ApiProperty({ example: 40.7128, description: 'Latitude' })
  @IsNumber()
  @Type(() => Number)
  lat: number;

  @ApiProperty({ example: -74.006, description: 'Longitude' })
  @IsNumber()
  @Type(() => Number)
  lng: number;

  @ApiProperty({ example: 5, description: 'Radius in kilometers', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0.1)
  @Max(50)
  @Type(() => Number)
  radius?: number;
}
