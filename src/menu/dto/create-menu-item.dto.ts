import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  IsDecimal,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'restaurant-id' })
  @IsString()
  restaurantId: string;

  @ApiProperty({ example: 'category-id', required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ example: 'Margherita Pizza' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Fresh tomatoes, mozzarella, basil' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '14.99' })
  @IsDecimal({ decimal_digits: '2' })
  price: string;

  @ApiProperty({ example: 'https://example.com/pizza.jpg' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isVegetarian?: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isVegan?: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isGlutenFree?: boolean;

  @ApiProperty({ example: 450 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  calories?: number;

  @ApiProperty({ example: 20, description: 'Preparation time in minutes' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  prepTime?: number;
}
