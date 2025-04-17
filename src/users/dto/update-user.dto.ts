import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: '123 Main St, City, Country' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'https://example.com/profile.jpg' })
  @IsString()
  @IsOptional()
  profileImage?: string;

  @ApiProperty({ example: 'I love trying new foods!' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    example: {
      dietaryPreferences: ['vegetarian', 'gluten-free'],
      favoriteCuisines: ['italian', 'mexican'],
    },
  })
  @IsObject()
  @IsOptional()
  preferences?: Record<string, any>;
}
