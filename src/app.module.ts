import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenuModule } from './menu/menu.module';
import { CartsModule } from './carts/carts.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PromotionsModule } from './promotions/promotions.module';
import { LocationModule } from './location/location.module';
import { AddressesModule } from './addresses/addresses.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DeliveryZonesModule } from './delivery-zones/delivery-zones.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    AddressesModule,
    RestaurantsModule,
    MenuModule,
    CartsModule,
    OrdersModule,
    HealthModule,
    NotificationsModule,
    PromotionsModule,
    LocationModule,
    AnalyticsModule,
    CategoriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
