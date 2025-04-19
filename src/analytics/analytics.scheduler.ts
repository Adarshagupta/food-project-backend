import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class AnalyticsScheduler {
  constructor(private analyticsService: AnalyticsService) {}

  // Run every day at midnight
  @Cron('0 0 * * *')
  async handleDailyAnalyticsUpdate() {
    await this.analyticsService.updateAnalyticsData();
  }
}
