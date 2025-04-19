import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DeliveryZonesService } from './delivery-zones.service';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Delivery Zones')
@Controller('delivery/zones')
export class DeliveryZonesController {
  constructor(private readonly deliveryZonesService: DeliveryZonesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new delivery zone (Admin)' })
  @ApiResponse({ status: 201, description: 'Delivery zone created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createDeliveryZoneDto: CreateDeliveryZoneDto) {
    return this.deliveryZonesService.create(createDeliveryZoneDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all delivery zones' })
  @ApiResponse({ status: 200, description: 'Returns all delivery zones' })
  async findAll() {
    return this.deliveryZonesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery zone by ID' })
  @ApiResponse({ status: 200, description: 'Returns the delivery zone' })
  @ApiResponse({ status: 404, description: 'Delivery zone not found' })
  async findOne(@Param('id') id: string) {
    return this.deliveryZonesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update delivery zone (Admin)' })
  @ApiResponse({ status: 200, description: 'Delivery zone updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Delivery zone not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDeliveryZoneDto: UpdateDeliveryZoneDto,
  ) {
    return this.deliveryZonesService.update(id, updateDeliveryZoneDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete delivery zone (Admin)' })
  @ApiResponse({ status: 200, description: 'Delivery zone deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Delivery zone not found' })
  async remove(@Param('id') id: string) {
    return this.deliveryZonesService.remove(id);
  }

  @Get('zip/:zipCode')
  @ApiOperation({ summary: 'Get delivery zones by zip code' })
  @ApiResponse({ status: 200, description: 'Returns delivery zones for the zip code' })
  async findByZipCode(@Param('zipCode') zipCode: string) {
    return this.deliveryZonesService.findByZipCode(zipCode);
  }

  @Get('check-availability')
  @ApiOperation({ summary: 'Check delivery availability' })
  @ApiResponse({ status: 200, description: 'Returns availability status' })
  @ApiQuery({ name: 'restaurantId', type: String, description: 'Restaurant ID' })
  @ApiQuery({ name: 'zipCode', type: String, description: 'Zip code' })
  async checkDeliveryAvailability(
    @Query('restaurantId') restaurantId: string,
    @Query('zipCode') zipCode: string,
  ) {
    return this.deliveryZonesService.checkDeliveryAvailability(restaurantId, zipCode);
  }
}
