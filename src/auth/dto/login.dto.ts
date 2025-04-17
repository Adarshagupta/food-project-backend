import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  password: string;
}
