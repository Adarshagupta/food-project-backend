import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveCartItemDto {
  @ApiProperty({ example: 'cart-item-id' })
  @IsString()
  cart_item_id: string;
}
