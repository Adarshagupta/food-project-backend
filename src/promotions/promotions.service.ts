import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createPromotionDto: CreatePromotionDto) {
    const promotion = await this.prisma.promotion.create({
      data: createPromotionDto,
    });

    // If promotion is active, notify users
    if (promotion.isActive) {
      this.notifyUsers(promotion);
    }

    return promotion;
  }

  async findAll() {
    return this.prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    return promotion;
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto) {
    // Check if promotion exists
    await this.findOne(id);

    // Update promotion
    const updatedPromotion = await this.prisma.promotion.update({
      where: { id },
      data: updatePromotionDto,
    });

    // If promotion was updated to active, notify users
    if (
      updatePromotionDto.isActive === true &&
      !updatePromotionDto.startDate &&
      !updatePromotionDto.endDate
    ) {
      this.notifyUsers(updatedPromotion);
    }

    return updatedPromotion;
  }

  async remove(id: string) {
    // Check if promotion exists
    await this.findOne(id);

    // Delete promotion
    await this.prisma.promotion.delete({
      where: { id },
    });

    return { message: 'Promotion deleted successfully' };
  }

  // Helper method to notify users about new promotions
  private async notifyUsers(promotion: any) {
    // In a real app, you would have logic to determine which users to notify
    // For now, we'll just get all users
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    // Send notification to each user
    for (const user of users) {
      this.notificationsService.createPromotionNotification(
        user.id,
        promotion.id,
        promotion.title,
        promotion.description || promotion.subtitle || '',
      );
    }
  }
}
