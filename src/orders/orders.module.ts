import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { CartsModule } from '../carts/carts.module';

@Module({
  imports: [CartsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
  exports: [OrdersService],
})
export class OrdersModule {}
