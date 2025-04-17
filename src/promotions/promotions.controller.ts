import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@ApiTags('Promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new promotion (Admin)' })
  @ApiResponse({ status: 201, description: 'Promotion created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active promotions' })
  @ApiResponse({ status: 200, description: 'Returns all active promotions' })
  async findAll() {
    return this.promotionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promotion by ID' })
  @ApiResponse({ status: 200, description: 'Returns the promotion' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  async findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update promotion by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Promotion updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete promotion by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Promotion deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  async remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}
