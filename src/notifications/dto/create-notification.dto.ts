import { IsString, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: 'user-id' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'Order Confirmed' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Your order #12345 has been confirmed.' })
  @IsString()
  message: string;

  @ApiProperty({ example: 'order_update', description: 'order_update, promotion, system' })
  @IsString()
  type: string;

  @ApiProperty({
    example: { orderId: 'order-id', orderNumber: '12345', status: 'confirmed' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}
