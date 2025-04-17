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
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@ApiTags('Menu')
@Controller()
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('menu-items')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new menu item (Admin)' })
  @ApiResponse({ status: 201, description: 'Menu item created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuService.create(createMenuItemDto);
  }

  @Get('menu-items')
  @ApiOperation({ summary: 'Get all menu items' })
  @ApiResponse({ status: 200, description: 'Returns all menu items' })
  async findAll() {
    return this.menuService.findAll();
  }

  @Get('restaurants/:restaurantId/menu')
  @ApiOperation({ summary: 'Get menu items for a restaurant' })
  @ApiResponse({ status: 200, description: 'Returns menu items for the restaurant' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async findByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.menuService.findByRestaurant(restaurantId);
  }

  @Get('menu-items/:id')
  @ApiOperation({ summary: 'Get menu item by ID' })
  @ApiResponse({ status: 200, description: 'Returns the menu item' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Patch('menu-items/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu item by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Menu item updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuService.update(id, updateMenuItemDto);
  }

  @Delete('menu-items/:id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete menu item by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Menu item deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
