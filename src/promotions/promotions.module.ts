import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
