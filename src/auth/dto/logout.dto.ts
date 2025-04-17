import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({ description: 'JWT token to invalidate' })
  @IsString()
  token: string;
}
