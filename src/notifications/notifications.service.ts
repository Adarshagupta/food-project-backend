import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: createNotificationDto,
    });

    // Send real-time notification
    this.notificationsGateway.sendNotification(
      notification.userId,
      notification,
    );

    return notification;
  }

  async findAllForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  }

  async remove(id: string, userId: string) {
    await this.prisma.notification.delete({
      where: { id, userId },
    });

    return { message: 'Notification deleted successfully' };
  }

  // Helper methods for creating specific types of notifications

  async createOrderStatusNotification(
    userId: string,
    orderId: string,
    orderNumber: string,
    status: string,
  ) {
    let title: string;
    let message: string;

    switch (status) {
      case 'confirmed':
        title = 'Order Confirmed';
        message = `Your order #${orderNumber} has been confirmed and is being prepared.`;
        break;
      case 'preparing':
        title = 'Order Being Prepared';
        message = `Your order #${orderNumber} is now being prepared.`;
        break;
      case 'ready':
        title = 'Order Ready';
        message = `Your order #${orderNumber} is ready for pickup/delivery.`;
        break;
      case 'out_for_delivery':
        title = 'Order Out for Delivery';
        message = `Your order #${orderNumber} is on its way to you.`;
        break;
      case 'delivered':
        title = 'Order Delivered';
        message = `Your order #${orderNumber} has been delivered. Enjoy!`;
        break;
      case 'cancelled':
        title = 'Order Cancelled';
        message = `Your order #${orderNumber} has been cancelled.`;
        break;
      default:
        title = 'Order Update';
        message = `Your order #${orderNumber} status has been updated to ${status}.`;
    }

    return this.create({
      userId,
      title,
      message,
      type: 'order_update',
      data: { orderId, orderNumber, status },
    });
  }

  async createPromotionNotification(
    userId: string,
    promotionId: string,
    title: string,
    description: string,
  ) {
    return this.create({
      userId,
      title,
      message: description,
      type: 'promotion',
      data: { promotionId },
    });
  }
}
