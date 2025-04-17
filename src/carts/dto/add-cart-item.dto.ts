import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddCartItemDto {
  @ApiProperty({ example: 'menu-item-id' })
  @IsString()
  menu_item_id: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ example: 'No onions, extra cheese', required: false })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}
