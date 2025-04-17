import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        restaurants: {
          include: {
            restaurant: true,
          },
        },
        menuItems: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    // Check if category exists
    await this.findOne(id);

    // Update category
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    // Check if category exists
    await this.findOne(id);

    // Delete category
    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }
}
