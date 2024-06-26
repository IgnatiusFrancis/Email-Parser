import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('QUEUE_HOST');
    this.logger.log(`Connecting to Redis at: ${redisUrl}`);

    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error:', err);
    });
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis connection failed:', error);
      return false;
    }
  }

  async setValue(key: string, value: string, expirySeconds?: number): Promise<void> {
    try {
      if (expirySeconds) {
        await this.redis.set(key, value, 'EX', expirySeconds);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error) {
      console.error(`Error setting value for key ${key}:`, error);
      throw error; 
    }
  }
  

  async getValue(key: string): Promise<string | null> {
    return this.redis.get(key);
  }
}
