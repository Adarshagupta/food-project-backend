import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { RedisService } from '../redis/redis.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationsGateway');
  private userSockets = new Map<string, string[]>();

  constructor(private redisService: RedisService) {}

  afterInit() {
    this.logger.log('NotificationsGateway initialized');

    // Subscribe to Redis channels for notifications
    this.subscribeToNotifications();
  }

  private async subscribeToNotifications() {
    try {
      // Subscribe to notification events
      await this.redisService.subscribe('notifications', (message, channel) => {
        this.logger.log(`Received notification from ${channel}`);
        const notification = JSON.parse(message);
        this.sendNotification(notification.userId, notification);
      });

      this.logger.log('Subscribed to Redis notification channel');
    } catch (error) {
      this.logger.error(`Failed to subscribe to Redis notification channel: ${error.message}`);
    }
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const token = client.handshake.query.token as string;

    if (userId && token) {
      // Verify Firebase token
      admin.auth()
        .verifyIdToken(token)
        .then((decodedToken) => {
          if (decodedToken.uid === userId) {
            // Store socket connection for this user
            const userSocketIds = this.userSockets.get(userId) || [];
            userSocketIds.push(client.id);
            this.userSockets.set(userId, userSocketIds);

            // Join user to their own room
            client.join(`user-${userId}`);

            this.logger.log(`Client connected: ${client.id}, User: ${userId}`);
          } else {
            // Token doesn't match user ID
            client.disconnect();
            this.logger.warn(`Token mismatch for user ${userId}`);
          }
        })
        .catch((error) => {
          // Invalid token
          client.disconnect();
          this.logger.warn(`Invalid token: ${error.message}`);
        });
    } else {
      // Missing user ID or token
      client.disconnect();
      this.logger.warn('Missing user ID or token');
    }
  }

  handleDisconnect(client: Socket) {
    // Find user ID for this socket
    for (const [userId, socketIds] of this.userSockets.entries()) {
      if (socketIds.includes(client.id)) {
        // Remove socket from user's connections
        const updatedSocketIds = socketIds.filter(id => id !== client.id);

        if (updatedSocketIds.length > 0) {
          this.userSockets.set(userId, updatedSocketIds);
        } else {
          this.userSockets.delete(userId);
        }

        this.logger.log(`Client disconnected: ${client.id}, User: ${userId}`);
        break;
      }
    }
  }

  sendNotification(userId: string, notification: any) {
    this.logger.log(`Sending notification to user ${userId}`);

    // Send notification to user via WebSocket
    this.server.to(`user-${userId}`).emit('notification', notification);

    // Also send push notification if we have FCM token
    // This would require storing FCM tokens for users
    // and using Firebase Admin SDK to send push notifications

    // Publish to Redis for other services
    this.redisService.publish('notifications', JSON.stringify({
      userId,
      ...notification
    }));
  }
}
