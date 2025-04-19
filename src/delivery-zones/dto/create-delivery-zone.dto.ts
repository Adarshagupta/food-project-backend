import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeliveryZoneDto {
  @ApiProperty({ example: 'Downtown' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ example: '10001, 10002, 10003' })
  @IsString()
  zipCodes: string;

  @ApiProperty({ example: 15.00 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minOrderAmount: number;

  @ApiProperty({ example: 2.99 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  deliveryFee: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  estimatedDeliveryTime: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive: boolean = true;
}
