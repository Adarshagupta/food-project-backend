import { ApiProperty } from '@nestjs/swagger';

export class SalesAnalyticsResponseDto {
  @ApiProperty({ example: '2023-04-15' })
  date: string;

  @ApiProperty({ example: 1500.50 })
  totalSales: number;

  @ApiProperty({ example: 75 })
  totalOrders: number;

  @ApiProperty({ example: 20.01 })
  averageOrderValue: number;
}

export class RestaurantAnalyticsResponseDto {
  @ApiProperty({ example: '2023-04-15' })
  date: string;

  @ApiProperty({ example: 'restaurant-id' })
  restaurantId: string;

  @ApiProperty({ example: 'Restaurant Name' })
  restaurantName: string;

  @ApiProperty({ example: 25 })
  totalOrders: number;

  @ApiProperty({ example: 500.25 })
  totalRevenue: number;

  @ApiProperty({ example: 4.5 })
  averageRating: number;
}

export class CustomerAnalyticsResponseDto {
  @ApiProperty({ example: '2023-04-15' })
  date: string;

  @ApiProperty({ example: 150 })
  totalCustomers: number;

  @ApiProperty({ example: 50 })
  newCustomers: number;

  @ApiProperty({ example: 75 })
  returningCustomers: number;

  @ApiProperty({ example: 85.5 })
  retentionRate: number;
}

export class DeliveryAnalyticsResponseDto {
  @ApiProperty({ example: '2023-04-15' })
  date: string;

  @ApiProperty({ example: 35.5 })
  averageDeliveryTime: number;

  @ApiProperty({ example: 92.5 })
  onTimeDeliveryRate: number;

  @ApiProperty({ example: 15.2 })
  averagePreparationTime: number;

  @ApiProperty({ example: 3.5 })
  averageDeliveryDistance: number;

  @ApiProperty({ example: 100 })
  totalDeliveries: number;

  @ApiProperty({ example: 4.8 })
  customerSatisfactionRate: number;
}
