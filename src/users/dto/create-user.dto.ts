import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 28.6139, required: false })
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: 77.2090, required: false })
  @IsOptional()
  longitude?: number;

  @ApiProperty({ example: 'Home', required: false })
  @IsOptional()
  label?: string;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsOptional()
  street?: string;

  @ApiProperty({ example: 'New Delhi', required: false })
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'Delhi', required: false })
  @IsOptional()
  state?: string;

  @ApiProperty({ example: '110001', required: false })
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'firebase123' })
  @IsString()
  @IsOptional()
  firebaseUid?: string;

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
}
