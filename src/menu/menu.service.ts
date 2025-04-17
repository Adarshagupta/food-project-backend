import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuItemDto: CreateMenuItemDto) {
    // Check if restaurant exists
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: createMenuItemDto.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${createMenuItemDto.restaurantId} not found`,
      );
    }

    // Check if category exists if provided
    if (createMenuItemDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: createMenuItemDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${createMenuItemDto.categoryId} not found`,
        );
      }
    }

    // Create menu item
    const menuItem = await this.prisma.menuItem.create({
      data: createMenuItemDto,
      include: {
        restaurant: true,
        category: true,
      },
    });

    return menuItem;
  }

  async findAll() {
    return this.prisma.menuItem.findMany({
      include: {
        restaurant: true,
        category: true,
      },
    });
  }

  async findOne(id: string) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        restaurant: true,
        category: true,
      },
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return menuItem;
  }

  async findByRestaurant(restaurantId: string) {
    // Check if restaurant exists
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }

    // Get menu items for restaurant
    const menuItems = await this.prisma.menuItem.findMany({
      where: { restaurantId },
      include: {
        category: true,
      },
    });

    return menuItems;
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto) {
    // Check if menu item exists
    await this.findOne(id);

    // Check if restaurant exists if provided
    if (updateMenuItemDto.restaurantId) {
      const restaurant = await this.prisma.restaurant.findUnique({
        where: { id: updateMenuItemDto.restaurantId },
      });

      if (!restaurant) {
        throw new NotFoundException(
          `Restaurant with ID ${updateMenuItemDto.restaurantId} not found`,
        );
      }
    }

    // Check if category exists if provided
    if (updateMenuItemDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateMenuItemDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateMenuItemDto.categoryId} not found`,
        );
      }
    }

    // Update menu item
    const updatedMenuItem = await this.prisma.menuItem.update({
      where: { id },
      data: updateMenuItemDto,
      include: {
        restaurant: true,
        category: true,
      },
    });

    return updatedMenuItem;
  }

  async remove(id: string) {
    // Check if menu item exists
    await this.findOne(id);

    // Delete menu item
    await this.prisma.menuItem.delete({
      where: { id },
    });

    return { message: 'Menu item deleted successfully' };
  }
}
