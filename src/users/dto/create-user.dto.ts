import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
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
