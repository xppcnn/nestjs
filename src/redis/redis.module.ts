import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { Redis } from 'ioredis';

const redisProvider = {
  provide: 'REDIS_CLIENT', // You can use a string token or create a symbol
  useFactory: () => {
    const redisInstance = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT!),
      password: process.env.REDIS_PASSWORD,
      db: 0,
    });

    redisInstance.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    redisInstance.on('connect', () => {
      console.log('Connected to Redis');
    });

    return redisInstance;
  },
};

@Global() // Make the provider available globally if needed
@Module({
  providers: [redisProvider, RedisService],
  exports: [redisProvider, RedisService], // Export both the client and the service
})
export class RedisModule {}
