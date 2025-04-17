import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Category description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Category image URL', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'Category emoji', required: false })
  @IsOptional()
  @IsString()
  emoji?: string;
}
