import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { format, subDays, subMonths, subWeeks, subYears } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSalesAnalytics(timeRange: string = 'week') {
    const startDate = this.getStartDateForRange(timeRange);
    
    const salesAnalytics = await this.prisma.salesAnalytics.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return salesAnalytics.map(item => ({
      date: format(item.date, 'yyyy-MM-dd'),
      totalSales: parseFloat(item.totalSales.toString()),
      totalOrders: item.totalOrders,
      averageOrderValue: parseFloat(item.averageOrderValue.toString()),
    }));
  }

  async getRestaurantAnalytics(timeRange: string = 'week') {
    const startDate = this.getStartDateForRange(timeRange);
    
    const restaurantAnalytics = await this.prisma.restaurantAnalytics.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      include: {
        restaurant: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return restaurantAnalytics.map(item => ({
      date: format(item.date, 'yyyy-MM-dd'),
      restaurantId: item.restaurantId,
      restaurantName: item.restaurant.name,
      totalOrders: item.totalOrders,
      totalRevenue: parseFloat(item.totalRevenue.toString()),
      averageRating: item.averageRating,
    }));
  }

  async getCustomerAnalytics(timeRange: string = 'week') {
    const startDate = this.getStartDateForRange(timeRange);
    
    // For customer analytics, we'll calculate based on user registration and order data
    // This is a simplified implementation
    const endDate = new Date();
    
    // Get total users
    const totalUsers = await this.prisma.user.count();
    
    // Get new users in the time range
    const newUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });
    
    // Get users who placed orders in the time range
    const activeUsers = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });
    
    // Calculate retention rate (active users / total users)
    const retentionRate = totalUsers > 0 ? (activeUsers.length / totalUsers) * 100 : 0;
    
    return [
      {
        date: format(endDate, 'yyyy-MM-dd'),
        totalCustomers: totalUsers,
        newCustomers: newUsers,
        returningCustomers: activeUsers.length - newUsers > 0 ? activeUsers.length - newUsers : 0,
        retentionRate: parseFloat(retentionRate.toFixed(2)),
      },
    ];
  }

  async getDeliveryAnalytics(timeRange: string = 'week') {
    const startDate = this.getStartDateForRange(timeRange);
    
    const deliveryAnalytics = await this.prisma.deliveryAnalytics.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return deliveryAnalytics.map(item => ({
      date: format(item.date, 'yyyy-MM-dd'),
      averageDeliveryTime: item.averageDeliveryTime,
      onTimeDeliveryRate: item.onTimeDeliveryRate,
      averagePreparationTime: item.averagePreparationTime,
      averageDeliveryDistance: item.averageDeliveryDistance,
      totalDeliveries: item.totalDeliveries,
      customerSatisfactionRate: item.customerSatisfactionRate,
    }));
  }

  async updateAnalyticsData() {
    // This method would be called by a scheduler to update analytics data
    // For now, we'll implement a simplified version that generates some sample data
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate sales analytics
    await this.prisma.salesAnalytics.upsert({
      where: {
        id: await this.getAnalyticsIdForDate(today, 'sales'),
      },
      update: {
        totalSales: Math.random() * 2000 + 1000,
        totalOrders: Math.floor(Math.random() * 100) + 50,
        averageOrderValue: Math.random() * 30 + 15,
      },
      create: {
        date: today,
        totalSales: Math.random() * 2000 + 1000,
        totalOrders: Math.floor(Math.random() * 100) + 50,
        averageOrderValue: Math.random() * 30 + 15,
      },
    });
    
    // Generate delivery analytics
    await this.prisma.deliveryAnalytics.upsert({
      where: {
        id: await this.getAnalyticsIdForDate(today, 'delivery'),
      },
      update: {
        averageDeliveryTime: Math.random() * 20 + 25,
        onTimeDeliveryRate: Math.random() * 10 + 85,
        averagePreparationTime: Math.random() * 10 + 10,
        averageDeliveryDistance: Math.random() * 3 + 2,
        totalDeliveries: Math.floor(Math.random() * 100) + 50,
        customerSatisfactionRate: Math.random() * 1 + 4,
      },
      create: {
        date: today,
        averageDeliveryTime: Math.random() * 20 + 25,
        onTimeDeliveryRate: Math.random() * 10 + 85,
        averagePreparationTime: Math.random() * 10 + 10,
        averageDeliveryDistance: Math.random() * 3 + 2,
        totalDeliveries: Math.floor(Math.random() * 100) + 50,
        customerSatisfactionRate: Math.random() * 1 + 4,
      },
    });
    
    // Generate restaurant analytics for each restaurant
    const restaurants = await this.prisma.restaurant.findMany();
    
    for (const restaurant of restaurants) {
      await this.prisma.restaurantAnalytics.upsert({
        where: {
          id: await this.getRestaurantAnalyticsIdForDate(today, restaurant.id),
        },
        update: {
          totalOrders: Math.floor(Math.random() * 50) + 10,
          totalRevenue: Math.random() * 1000 + 500,
          averageRating: Math.random() * 1.5 + 3.5,
        },
        create: {
          date: today,
          restaurantId: restaurant.id,
          totalOrders: Math.floor(Math.random() * 50) + 10,
          totalRevenue: Math.random() * 1000 + 500,
          averageRating: Math.random() * 1.5 + 3.5,
        },
      });
    }
    
    return { message: 'Analytics data updated successfully' };
  }

  private getStartDateForRange(timeRange: string): Date {
    const now = new Date();
    
    switch (timeRange) {
      case 'day':
        return subDays(now, 1);
      case 'week':
        return subWeeks(now, 1);
      case 'month':
        return subMonths(now, 1);
      case 'year':
        return subYears(now, 1);
      default:
        return subWeeks(now, 1);
    }
  }

  private async getAnalyticsIdForDate(date: Date, type: string): Promise<string> {
    // This is a helper method to get or create an analytics ID for a specific date
    // In a real implementation, you might want to use a more sophisticated approach
    
    let record;
    
    if (type === 'sales') {
      record = await this.prisma.salesAnalytics.findFirst({
        where: { date },
      });
    } else if (type === 'delivery') {
      record = await this.prisma.deliveryAnalytics.findFirst({
        where: { date },
      });
    }
    
    return record?.id || '';
  }

  private async getRestaurantAnalyticsIdForDate(date: Date, restaurantId: string): Promise<string> {
    const record = await this.prisma.restaurantAnalytics.findFirst({
      where: {
        date,
        restaurantId,
      },
    });
    
    return record?.id || '';
  }
}
