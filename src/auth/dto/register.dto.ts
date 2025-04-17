import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiProperty({ example: 'firebase123' })
  @IsString()
  @IsOptional()
  firebase_uid?: string;
}
