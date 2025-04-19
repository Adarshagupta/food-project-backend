import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Get sales analytics' })
  @ApiResponse({ status: 200, description: 'Returns sales analytics data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
    description: 'Time range for analytics',
  })
  async getSalesAnalytics(@Query('timeRange') timeRange: string) {
    return this.analyticsService.getSalesAnalytics(timeRange);
  }

  @Get('restaurants')
  @ApiOperation({ summary: 'Get restaurant performance analytics' })
  @ApiResponse({ status: 200, description: 'Returns restaurant performance analytics data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
    description: 'Time range for analytics',
  })
  async getRestaurantAnalytics(@Query('timeRange') timeRange: string) {
    return this.analyticsService.getRestaurantAnalytics(timeRange);
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get customer retention analytics' })
  @ApiResponse({ status: 200, description: 'Returns customer retention analytics data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
    description: 'Time range for analytics',
  })
  async getCustomerAnalytics(@Query('timeRange') timeRange: string) {
    return this.analyticsService.getCustomerAnalytics(timeRange);
  }

  @Get('delivery')
  @ApiOperation({ summary: 'Get delivery metrics analytics' })
  @ApiResponse({ status: 200, description: 'Returns delivery metrics analytics data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    enum: ['day', 'week', 'month', 'year'],
    description: 'Time range for analytics',
  })
  async getDeliveryAnalytics(@Query('timeRange') timeRange: string) {
    return this.analyticsService.getDeliveryAnalytics(timeRange);
  }

  @Post('update')
  @ApiOperation({ summary: 'Manually trigger analytics data update (Admin)' })
  @ApiResponse({ status: 200, description: 'Analytics data updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateAnalyticsData() {
    return this.analyticsService.updateAnalyticsData();
  }
}
