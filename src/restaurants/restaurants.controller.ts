import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FindNearbyDto } from './dto/find-nearby.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new restaurant (Admin)' })
  @ApiResponse({ status: 201, description: 'Restaurant created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all restaurants' })
  @ApiResponse({ status: 200, description: 'Returns all restaurants' })
  async findAll() {
    return this.restaurantsService.findAll();
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby restaurants' })
  @ApiResponse({ status: 200, description: 'Returns nearby restaurants' })
  async findNearby(@Query() findNearbyDto: FindNearbyDto) {
    return this.restaurantsService.findNearby(findNearbyDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant by ID' })
  @ApiResponse({ status: 200, description: 'Returns the restaurant' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update restaurant by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Restaurant updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, updateRestaurantDto);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete restaurant by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Restaurant deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async remove(@Param('id') id: string) {
    return this.restaurantsService.remove(id);
  }
}
