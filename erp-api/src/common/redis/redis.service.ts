import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis | null = null;
    private memoryStore = new Map<string, { value: string, expiry: number }>();
    private readonly logger = new Logger(RedisService.name);
    private useMemory = false;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        try {
            const host = this.configService.get<string>('REDIS_HOST', 'localhost');
            const port = this.configService.get<number>('REDIS_PORT', 6379);

            this.client = new Redis({
                host,
                port,
                password: this.configService.get<string>('REDIS_PASSWORD'),
                retryStrategy: (times) => {
                    if (times > 3) {
                        this.logger.warn('Redis connection failed, switching to in-memory fallback');
                        this.useMemory = true;
                        return null; // Stop retrying
                    }
                    return Math.min(times * 50, 2000);
                }
            });

            this.client.on('error', (err) => {
                if (!this.useMemory) {
                    this.logger.error(`Redis error: ${err.message}`);
                }
            });
        } catch (e) {
            this.logger.warn('Failed to initialize Redis, using in-memory fallback');
            this.useMemory = true;
        }
    }

    onModuleDestroy() {
        if (this.client) {
            this.client.disconnect();
        }
    }

    async get(key: string): Promise<string | null> {
        if (this.useMemory || !this.client) {
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
            this.useMemory = true;
            return this.get(key);
        }
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (this.useMemory || !this.client) {
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
            this.useMemory = true;
            await this.set(key, value, ttl);
        }
    }

    async del(key: string): Promise<void> {
        if (this.useMemory || !this.client) {
            this.memoryStore.delete(key);
            return;
        }
        try {
            await this.client.del(key);
        } catch (e) {
            this.useMemory = true;
            await this.del(key);
        }
    }
}
