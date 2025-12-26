import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { tap, mergeMap } from 'rxjs/operators';
import { Request } from 'express';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private redisService: RedisService) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    // Only apply to POST, PUT, PATCH methods
    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
      return next.handle();
    }

    const idempotencyKey = request.headers['idempotency-key'] as string;

    if (!idempotencyKey) {
      return next.handle();
    }

    const redisKey = `idempotency:${idempotencyKey}`;

    // Check if we have a cached response for this key
    const cachedString = await this.redisService.get(redisKey);
    if (cachedString) {
      const cached = JSON.parse(cachedString);
      if (cached.pending) {
        throw new ConflictException('Request with this idempotency key is already in progress');
      }
      return of(cached.result);
    }

    // Mark as pending in Redis (TTL 10 seconds for pending state)
    await this.redisService.set(redisKey, JSON.stringify({ pending: true }), 10);

    return next.handle().pipe(
      mergeMap(async (result) => {
        // Cache the successful result (TTL 1 hour)
        await this.redisService.set(
          redisKey,
          JSON.stringify({
            pending: false,
            result,
            timestamp: Date.now(),
          }),
          3600
        );
        return result;
      }),
      tap({
        error: async () => {
          // Remove pending flag on error
          await this.redisService.del(redisKey);
        },
      }),
    );
  }
}