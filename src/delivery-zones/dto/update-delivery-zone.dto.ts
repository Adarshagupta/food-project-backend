import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDeliveryZoneDto {
  @ApiProperty({ example: 'Downtown' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: '10001, 10002, 10003' })
  @IsString()
  @IsOptional()
  zipCodes?: string;

  @ApiProperty({ example: 15.00 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minOrderAmount?: number;

  @ApiProperty({ example: 2.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  deliveryFee?: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  estimatedDeliveryTime?: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
