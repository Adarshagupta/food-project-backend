import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createAddressDto: CreateAddressDto) {
    // If this address is set as default, unset any existing default addresses
    if (createAddressDto.isDefault) {
      await this.unsetDefaultAddresses(userId);
    }

    return this.prisma.address.create({
      data: {
        ...createAddressDto,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    if (address.userId !== userId) {
      throw new BadRequestException('You do not have permission to access this address');
    }

    return address;
  }

  async update(userId: string, id: string, updateAddressDto: UpdateAddressDto) {
    // Check if address exists and belongs to user
    await this.findOne(userId, id);

    // If this address is being set as default, unset any existing default addresses
    if (updateAddressDto.isDefault) {
      await this.unsetDefaultAddresses(userId);
    }

    return this.prisma.address.update({
      where: { id },
      data: updateAddressDto,
    });
  }

  async remove(userId: string, id: string) {
    // Check if address exists and belongs to user
    await this.findOne(userId, id);

    // Delete address
    await this.prisma.address.delete({
      where: { id },
    });

    return { message: 'Address deleted successfully' };
  }

  async getDefaultAddress(userId: string) {
    return this.prisma.address.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });
  }

  private async unsetDefaultAddresses(userId: string) {
    await this.prisma.address.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }
}
