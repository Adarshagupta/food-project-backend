import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Pizza Palace' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'The best pizza in town' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  zipCode: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'contact@pizzapalace.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'https://pizzapalace.com' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ example: 'https://example.com/logo.jpg' })
  @IsString()
  @IsOptional()
  logoImage?: string;

  @ApiProperty({ example: 'https://example.com/cover.jpg' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiProperty({ example: 40.7128 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: -74.006 })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ example: 4.5 })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiProperty({ example: 2, description: 'Price level (1-4)' })
  @IsNumber()
  @Min(1)
  @Max(4)
  @IsOptional()
  priceLevel?: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
    },
  })
  @IsObject()
  @IsOptional()
  openingHours?: Record<string, any>;

  @ApiProperty({ example: ['category-id-1', 'category-id-2'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];
}
