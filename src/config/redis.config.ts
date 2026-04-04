import { env } from '../config/env';

function getRedisConfig() {
  const isProduction = env.nodeEnv === 'production';

  if (isProduction && env.redis.url) {
    return {
      url: env.redis.url,
    };
  }

  return {
    socket: {
      host: env.redis.host,
      port: env.redis.port,
    },
    password: env.redis.password || undefined,
    database: env.redis.db ?? 0,
  };
}

export default getRedisConfig;
