import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({ example: '123 Main St, New York, NY 10001' })
  @IsString()
  deliveryAddress: string;

  @ApiProperty({ example: 'credit_card' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ example: 'pending', required: false })
  @IsString()
  @IsOptional()
  paymentStatus?: string;

  @ApiProperty({ example: 2.99, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  deliveryFee?: number;

  @ApiProperty({ example: 2.00, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  tip?: number;

  @ApiProperty({ example: 'Please ring the doorbell', required: false })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}
