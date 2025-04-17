import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
  IsDecimal,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
  @ApiProperty({ example: '50% OFF' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'First Order', required: false })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({ example: 'Get 50% off on your first order', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'WELCOME50', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    example: 'percentage',
    description: 'percentage, fixed_amount, free_delivery',
  })
  @IsEnum(['percentage', 'fixed_amount', 'free_delivery'])
  discountType: string;

  @ApiProperty({ example: '50.00', required: false })
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  discountValue?: string;

  @ApiProperty({ example: '10.00', required: false })
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  minOrderValue?: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({ example: 'https://example.com/promo.jpg', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: '#FF4B3A', required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
