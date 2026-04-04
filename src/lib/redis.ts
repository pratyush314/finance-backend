/* eslint-disable @typescript-eslint/no-explicit-any */
import RedisStore from 'rate-limit-redis';
import { createClient, type RedisClientType } from 'redis';
import getRedisConfig from '../config/redis.config';

let redisClient: RedisClientType | null = null;
let isRedisConnected = false;

export async function initializeRedis() {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient(getRedisConfig());

    redisClient.on('error', (error) => {
      console.error('❌ Redis error:', error);
      isRedisConnected = false;
      console.warn('⚠️ Redis disconnected - rate limiting may not persist');
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected for rate limiting');
      isRedisConnected = true;
    });

    redisClient.on('end', () => {
      isRedisConnected = false;
      console.warn('⚠️ Redis connection closed');
    });

    await redisClient.connect();

    isRedisConnected = true;
    return redisClient;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
    console.warn(
      '⚠️ Rate limiting will use in-memory store (NOT recommended for production)'
    );
    redisClient = null;
    isRedisConnected = false;
    return null;
  }
}

export function getRedisStore(prefix: string) {
  if (isRedisConnected && redisClient) {
    return new (RedisStore as any)({
      sendCommand: (...args: string[]) => redisClient!.sendCommand(args),
      prefix,
    });
  }

  return undefined;
}

export function isRedisClientConnected(): boolean {
  return isRedisConnected;
}

export async function disconnectRedis() {
  if (redisClient) {
    try {
      await redisClient.disconnect();
      console.log('✅ Redis disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Redis:', error);
    } finally {
      redisClient = null;
      isRedisConnected = false;
    }
  }
}
