import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'orders',
})
export class OrdersGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('OrdersGateway');
  private userSockets = new Map<string, string[]>();

  constructor(private redisService: RedisService) {}

  afterInit() {
    this.logger.log('OrdersGateway initialized');

    // Subscribe to Redis channels for order events
    this.subscribeToOrderEvents();
  }

  private async subscribeToOrderEvents() {
    try {
      // Subscribe to new order events
      await this.redisService.subscribe('new_order', (message, channel) => {
        this.logger.log(`Received message from ${channel}`);
        const order = JSON.parse(message);
        this.notifyNewOrder(order);
      });

      // Subscribe to order status updates
      await this.redisService.subscribe('order_status_update', (message, channel) => {
        this.logger.log(`Received message from ${channel}`);
        const update = JSON.parse(message);
        this.notifyOrderStatusUpdate(update);
      });

      this.logger.log('Subscribed to Redis channels');
    } catch (error) {
      this.logger.error(`Failed to subscribe to Redis channels: ${error.message}`);
    }
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      // Store socket connection for this user
      const userSocketIds = this.userSockets.get(userId) || [];
      userSocketIds.push(client.id);
      this.userSockets.set(userId, userSocketIds);

      // Join user to their own room
      client.join(`user-${userId}`);

      this.logger.log(`Client connected: ${client.id}, User: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      // Remove socket from user's connections
      const userSocketIds = this.userSockets.get(userId) || [];
      const updatedSocketIds = userSocketIds.filter(id => id !== client.id);

      if (updatedSocketIds.length > 0) {
        this.userSockets.set(userId, updatedSocketIds);
      } else {
        this.userSockets.delete(userId);
      }

      this.logger.log(`Client disconnected: ${client.id}, User: ${userId}`);
    }
  }

  notifyNewOrder(order: any) {
    this.logger.log(`Notifying about new order: ${order.id}`);

    // Notify restaurant about new order
    this.server.to(`restaurant-${order.restaurantId}`).emit('new-order', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      items: order.items,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    });

    // Notify user about order confirmation
    this.server.to(`user-${order.userId}`).emit('order-created', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
    });

    // Publish to Redis for Go microservices
    this.redisService.publish('new_order', JSON.stringify(order));
  }

  notifyOrderStatusUpdate(order: any) {
    this.logger.log(`Notifying about order status update: ${order.id} - ${order.status}`);

    // Notify user about order status update
    this.server.to(`user-${order.userId}`).emit('order-status-update', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      tracking: order.tracking,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      actualDeliveryTime: order.actualDeliveryTime,
    });

    // Notify restaurant about order status update
    this.server.to(`restaurant-${order.restaurantId}`).emit('order-status-update', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
    });

    // Publish to Redis for Go microservices
    this.redisService.publish('order_status_update', JSON.stringify({
      orderId: order.id,
      status: order.status,
    }));
  }
}
