import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        firebaseUid: createUserDto.firebaseUid,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phoneNumber: createUserDto.phoneNumber,
        profile: {
          create: {}, // Create empty profile
        },
      },
    });

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        profile: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByFirebaseUid(firebaseUid: string) {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with Firebase UID ${firebaseUid} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    await this.findOne(id);

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        phoneNumber: updateUserDto.phoneNumber,
        address: updateUserDto.address,
        profileImage: updateUserDto.profileImage,
        profile: updateUserDto.preferences
          ? {
              update: {
                preferences: updateUserDto.preferences,
                bio: updateUserDto.bio,
              },
            }
          : undefined,
      },
      include: {
        profile: true,
      },
    });

    return updatedUser;
  }

  async remove(id: string) {
    // Check if user exists
    await this.findOne(id);

    // Delete user
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}
