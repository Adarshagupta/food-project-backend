import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: any;
  private subscriber: any;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Create Redis client
    const redisUrl = this.configService.get<string>('REDIS_URL');
    this.logger.log(`Connecting to Redis at ${redisUrl}`);

    this.client = createClient({
      url: redisUrl,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis client connected');
    });

    await this.client.connect();

    // Create subscriber client
    this.subscriber = this.client.duplicate();
    
    this.subscriber.on('error', (err) => {
      this.logger.error('Redis Subscriber Error', err);
    });

    await this.subscriber.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.subscriber.quit();
  }

  getClient() {
    return this.client;
  }

  getSubscriber() {
    return this.subscriber;
  }

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      return this.client.set(key, value, { EX: ttl });
    }
    return this.client.set(key, value);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async del(key: string) {
    return this.client.del(key);
  }

  async subscribe(channel: string, callback: (message: string, channel: string) => void) {
    await this.subscriber.subscribe(channel, callback);
  }

  async publish(channel: string, message: string) {
    return this.client.publish(channel, message);
  }

  async hset(key: string, field: string, value: string) {
    return this.client.hSet(key, field, value);
  }

  async hget(key: string, field: string) {
    return this.client.hGet(key, field);
  }

  async hgetall(key: string) {
    return this.client.hGetAll(key);
  }

  async hdel(key: string, field: string) {
    return this.client.hDel(key, field);
  }

  async lpush(key: string, value: string) {
    return this.client.lPush(key, value);
  }

  async rpush(key: string, value: string) {
    return this.client.rPush(key, value);
  }

  async lrange(key: string, start: number, stop: number) {
    return this.client.lRange(key, start, stop);
  }

  async lrem(key: string, count: number, value: string) {
    return this.client.lRem(key, count, value);
  }
}
