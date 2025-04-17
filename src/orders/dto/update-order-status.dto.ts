import { IsString, IsOptional, IsObject, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 'confirmed',
    description: 'Order status: pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled',
  })
  @IsString()
  status: string;

  @ApiProperty({ example: 'driver-id', required: false })
  @IsString()
  @IsOptional()
  driverId?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  driverName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  driverPhone?: string;

  @ApiProperty({
    example: { lat: 40.7128, lng: -74.006 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  driverLocation?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  estimatedArrival?: Date;
}
