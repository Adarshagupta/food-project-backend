import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';

@Injectable()
export class DeliveryZonesService {
  constructor(private prisma: PrismaService) {}

  async create(createDeliveryZoneDto: CreateDeliveryZoneDto) {
    return this.prisma.deliveryZone.create({
      data: createDeliveryZoneDto,
    });
  }

  async findAll() {
    return this.prisma.deliveryZone.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const deliveryZone = await this.prisma.deliveryZone.findUnique({
      where: { id },
    });

    if (!deliveryZone) {
      throw new NotFoundException(`Delivery zone with ID ${id} not found`);
    }

    return deliveryZone;
  }

  async update(id: string, updateDeliveryZoneDto: UpdateDeliveryZoneDto) {
    // Check if delivery zone exists
    await this.findOne(id);

    // Update delivery zone
    return this.prisma.deliveryZone.update({
      where: { id },
      data: updateDeliveryZoneDto,
    });
  }

  async remove(id: string) {
    // Check if delivery zone exists
    await this.findOne(id);

    // Delete delivery zone
    await this.prisma.deliveryZone.delete({
      where: { id },
    });

    return { message: 'Delivery zone deleted successfully' };
  }

  async findByZipCode(zipCode: string) {
    return this.prisma.deliveryZone.findMany({
      where: {
        zipCodes: {
          contains: zipCode,
        },
        isActive: true,
      },
    });
  }

  async checkDeliveryAvailability(restaurantId: string, zipCode: string) {
    // Find delivery zones that include the zip code
    const deliveryZones = await this.findByZipCode(zipCode);

    if (deliveryZones.length === 0) {
      return {
        available: false,
        message: 'Delivery is not available in this area',
      };
    }

    // For now, we'll assume that if a delivery zone exists for the zip code,
    // then delivery is available for all restaurants
    // In a real implementation, you might want to check if the restaurant
    // is associated with any of the delivery zones

    return {
      available: true,
      deliveryFee: deliveryZones[0].deliveryFee,
      minOrderAmount: deliveryZones[0].minOrderAmount,
      estimatedDeliveryTime: deliveryZones[0].estimatedDeliveryTime,
    };
  }
}
