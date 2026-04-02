/* eslint-disable @typescript-eslint/no-explicit-any */
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { env } from '../config/env.js';

let redisClient: ReturnType<typeof createClient> | null = null;
let isRedisConnected = false;

export async function initializeRedis() {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      socket: {
        host: env.redis.host,
        port: env.redis.port,
      },
      password: env.redis.password || undefined,
    });

    redisClient.on('error', (error) => {
      console.error('❌ Redis error:', error);
      isRedisConnected = false;
      console.warn('⚠️  Redis disconnected - rate limiting may not persist');
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected for rate limiting');
      isRedisConnected = true;
    });

    await redisClient.connect();

    if (env.redis.db && env.redis.db !== 0) {
      await redisClient.select(env.redis.db);
    }

    isRedisConnected = true;

    return redisClient;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
    console.warn(
      '⚠️  Rate limiting will use in-memory store (NOT recommended for production)'
    );
    isRedisConnected = false;
    return null;
  }
}

export function getRedisStore(prefix: string): any {
  if (isRedisConnected && redisClient) {
    return new (RedisStore as any)({
      sendCommand: async (...args: string[]) => {
        return (redisClient as any).sendCommand(args);
      },
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
      isRedisConnected = false;
    } catch (error) {
      console.error('❌ Error disconnecting Redis:', error);
    }
  }
}
