import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private memoryStore = new Map<string, { value: string; expiry: number }>();
  private readonly logger = new Logger(RedisService.name);
  private useMemory = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      // 1. Birinchi navbatda Docker-compose'dagi REDIS_URL ni o'qiymiz
      const redisUrl = this.configService.get<string>('REDIS_URL');
      
      // 2. Agar REDIS_URL bo'lmasa, individual host va portni o'qiymiz
      const host = this.configService.get<string>('REDIS_HOST', 'redis');
      const port = this.configService.get<number>('REDIS_PORT', 6379);
      const password = this.configService.get<string>('REDIS_PASSWORD');

      this.logger.log(`Attempting to connect to Redis: ${redisUrl ? 'via URL' : host + ':' + port}`);

      const connectionOptions = redisUrl 
        ? redisUrl 
        : {
            host,
            port,
            password,
          };

      this.client = new Redis(connectionOptions as any, {
        // Tarmoq uzilsa qayta ulanish strategiyasi
        retryStrategy: (times) => {
          const delay = Math.min(times * 100, 3000);
          if (times > 5) {
            this.logger.warn('Redis connection failed after 5 attempts, switching to in-memory fallback');
            this.useMemory = true;
            return null; // Qayta urinishni to'xtatish
          }
          return delay;
        },
        // Ulanish vaqti chegarasi
        connectTimeout: 10000,
      });

      this.client.on('connect', () => {
        this.logger.log('Successfully connected to Redis');
        this.useMemory = false;
      });

      this.client.on('error', (err) => {
        // Faqat xotira rejimiga o'tmagan bo'lsak xatoni ko'rsatamiz
        if (!this.useMemory) {
          this.logger.error(`Redis connection error: ${err.message}`);
        }
      });

    } catch (e) {
      this.logger.error('Critical failure during Redis initialization', e);
      this.useMemory = true;
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.useMemory || !this.client || this.client.status !== 'ready') {
      const item = this.memoryStore.get(key);
      if (!item) return null;
      if (item.expiry < Date.now()) {
        this.memoryStore.delete(key);
        return null;
      }
      return item.value;
    }
    try {
      return await this.client.get(key);
    } catch (e) {
      this.logger.warn(`Redis GET failed for key: ${key}, using memory fallback`);
      return this.getFallback(key);
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (this.useMemory || !this.client || this.client.status !== 'ready') {
      const expiry = Date.now() + (ttl ? ttl * 1000 : 24 * 60 * 60 * 1000);
      this.memoryStore.set(key, { value, expiry });
      return;
    }
    try {
      if (ttl) {
        await this.client.set(key, value, 'EX', ttl);
      } else {
        await this.client.set(key, value);
      }
    } catch (e) {
      this.logger.warn(`Redis SET failed for key: ${key}, using memory fallback`);
      const expiry = Date.now() + (ttl ? ttl * 1000 : 24 * 60 * 60 * 1000);
      this.memoryStore.set(key, { value, expiry });
    }
  }

  async del(key: string): Promise<void> {
    if (this.useMemory || !this.client || this.client.status !== 'ready') {
      this.memoryStore.delete(key);
      return;
    }
    try {
      await this.client.del(key);
    } catch (e) {
      this.memoryStore.delete(key);
    }
  }

  private getFallback(key: string): string | null {
    const item = this.memoryStore.get(key);
    return item ? item.value : null;
  }
}
