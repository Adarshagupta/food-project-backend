import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FindNearbyDto } from './dto/find-nearby.dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async create(createRestaurantDto: CreateRestaurantDto) {
    const { categories, ...restaurantData } = createRestaurantDto;

    const restaurant = await this.prisma.restaurant.create({
      data: {
        ...restaurantData,
        categories: {
          create: categories?.map(categoryId => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return restaurant;
  }

  async findAll() {
    return this.prisma.restaurant.findMany({
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return restaurant;
  }

  async findNearby(findNearbyDto: FindNearbyDto) {
    const { lat, lng, radius = 5 } = findNearbyDto;

    // Convert radius from kilometers to degrees (approximate)
    // 1 degree of latitude = ~111 km
    const latRadius = radius / 111;
    const lngRadius = radius / (111 * Math.cos(lat * (Math.PI / 180)));

    const restaurants = await this.prisma.restaurant.findMany({
      where: {
        latitude: {
          gte: lat - latRadius,
          lte: lat + latRadius,
        },
        longitude: {
          gte: lng - lngRadius,
          lte: lng + lngRadius,
        },
        isActive: true,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    // Calculate actual distance and sort by proximity
    const restaurantsWithDistance = restaurants.map(restaurant => {
      const distance = this.calculateDistance(
        lat,
        lng,
        restaurant.latitude,
        restaurant.longitude,
      );
      return { ...restaurant, distance };
    });

    return restaurantsWithDistance.sort((a, b) => a.distance - b.distance);
  }

  async update(id: string, updateRestaurantDto: UpdateRestaurantDto) {
    const { categories, ...restaurantData } = updateRestaurantDto;

    // Check if restaurant exists
    await this.findOne(id);

    // Update categories if provided
    if (categories) {
      // Delete existing category relationships
      await this.prisma.categoryOnRestaurant.deleteMany({
        where: { restaurantId: id },
      });

      // Create new category relationships
      for (const categoryId of categories) {
        await this.prisma.categoryOnRestaurant.create({
          data: {
            restaurant: { connect: { id } },
            category: { connect: { id: categoryId } },
          },
        });
      }
    }

    // Update restaurant
    const updatedRestaurant = await this.prisma.restaurant.update({
      where: { id },
      data: restaurantData,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return updatedRestaurant;
  }

  async remove(id: string) {
    // Check if restaurant exists
    await this.findOne(id);

    // Delete restaurant
    await this.prisma.restaurant.delete({
      where: { id },
    });

    return { message: 'Restaurant deleted successfully' };
  }

  // Helper method to calculate distance between two coordinates using Haversine formula
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    if (!lat1 || !lng1 || !lat2 || !lng2) {
      return Number.MAX_SAFE_INTEGER; // Return a large number if coordinates are missing
    }

    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
