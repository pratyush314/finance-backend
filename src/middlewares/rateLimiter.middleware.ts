/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { rateLimitConfig } from '../config/rateLimiter.js';
import {
  disconnectRedis,
  getRedisStore,
  initializeRedis,
  isRedisClientConnected,
} from '../lib/redis.js';

declare global {
  namespace Express {
    interface Request {
      rateLimit?: {
        limit: number;
        current: number;
        remaining: number;
        resetTime: Date;
      };
    }
  }
}

const rateLimiters: Record<string, any> = {};

export async function initializeAllRateLimiters() {
  await initializeRedis();
  createAllRateLimiters();
}

export { initializeRedis };

function createAllRateLimiters() {
  if (rateLimiters.globalRateLimiter) {
    return;
  }

  rateLimiters.globalRateLimiter = rateLimit({
    store: getRedisStore('rate-limit:global:'),
    windowMs: rateLimitConfig.global.windowMs,
    max: rateLimitConfig.global.max,
    message: rateLimitConfig.global.message,
    standardHeaders: rateLimitConfig.global.standardHeaders,
    legacyHeaders: rateLimitConfig.global.legacyHeaders,
    skip: rateLimitConfig.global.skip,
    handler: (req, res) => {
      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests. Please try again later.',
        retryAfter: req.rateLimit?.resetTime,
      });
    },
  });

  rateLimiters.loginRateLimiter = rateLimit({
    store: getRedisStore('rate-limit:auth:login:'),
    windowMs: rateLimitConfig.auth.login.windowMs,
    max: rateLimitConfig.auth.login.max,
    message: rateLimitConfig.auth.login.message,
    skipSuccessfulRequests: rateLimitConfig.auth.login.skipSuccessfulRequests,
    keyGenerator: rateLimitConfig.auth.login.keyGenerator,
    handler: (req, res) => {
      res.status(429).json({
        statusCode: 429,
        message: 'Too many login attempts. Please try again after 15 minutes.',
        retryAfter: req.rateLimit?.resetTime,
      });
    },
  });

  rateLimiters.createUserRateLimiter = rateLimit({
    store: getRedisStore('rate-limit:user:create:'),
    windowMs: rateLimitConfig.user.create.windowMs,
    max: rateLimitConfig.user.create.max,
    message: rateLimitConfig.user.create.message,
    keyGenerator: rateLimitConfig.user.create.keyGenerator,
    handler: (req, res) => {
      res.status(429).json({
        statusCode: 429,
        message: 'User creation limit reached. Try again in 1 hour.',
        retryAfter: req.rateLimit?.resetTime,
      });
    },
  });

  rateLimiters.updateUserRateLimiter = rateLimit({
    store: getRedisStore('rate-limit:user:update:'),
    windowMs: rateLimitConfig.user.update.windowMs,
    max: rateLimitConfig.user.update.max,
    keyGenerator: rateLimitConfig.user.update.keyGenerator,
  });

  rateLimiters.statusChangeRateLimiter = rateLimit({
    store: getRedisStore('rate-limit:user:status:'),
    windowMs: rateLimitConfig.user.statusChange.windowMs,
    max: rateLimitConfig.user.statusChange.max,
    message: rateLimitConfig.user.statusChange.message,
    keyGenerator: rateLimitConfig.user.statusChange.keyGenerator,
    handler: (req, res) => {
      res.status(429).json({
        statusCode: 429,
        message: 'Status change limit reached. Try again tomorrow.',
        retryAfter: req.rateLimit?.resetTime,
      });
    },
  });

  rateLimiters.deleteUserRateLimiter = rateLimit({
    store: getRedisStore('rate-limit:user:delete:'),
    windowMs: rateLimitConfig.user.delete.windowMs,
    max: rateLimitConfig.user.delete.max,
    message: rateLimitConfig.user.delete.message,
    keyGenerator: rateLimitConfig.user.delete.keyGenerator,
    handler: (req, res) => {
      res.status(429).json({
        statusCode: 429,
        message: 'User deletion limit reached. Try again tomorrow.',
        retryAfter: req.rateLimit?.resetTime,
      });
    },
  });

  rateLimiters.createRecordRateLimiter = rateLimit({
    store: getRedisStore('rate-limit:record:create:'),
    windowMs: rateLimitConfig.record.create.windowMs,
    max: rateLimitConfig.record.create.max,
    keyGenerator: rateLimitConfig.record.create.keyGenerator,
  });

  rateLimiters.updateRecordRateLimiter = rateLimit({
    store: getRedisStore('rate-limit:record:update:'),
    windowMs: rateLimitConfig.record.update.windowMs,
    max: rateLimitConfig.record.update.max,
    keyGenerator: rateLimitConfig.record.update.keyGenerator,
  });

  rateLimiters.deleteRecordRateLimiter = rateLimit({
    store: getRedisStore('rate-limit:record:delete:'),
    windowMs: rateLimitConfig.record.delete.windowMs,
    max: rateLimitConfig.record.delete.max,
    message: rateLimitConfig.record.delete.message,
    keyGenerator: rateLimitConfig.record.delete.keyGenerator,
    handler: (req, res) => {
      res.status(429).json({
        statusCode: 429,
        message: 'Record deletion limit reached. Try again later.',
        retryAfter: req.rateLimit?.resetTime,
      });
    },
  });

  rateLimiters.listRecordsRateLimiter = rateLimit({
    store: getRedisStore('rate-limit:record:list:'),
    windowMs: rateLimitConfig.record.list.windowMs,
    max: rateLimitConfig.record.list.max,
    keyGenerator: rateLimitConfig.record.list.keyGenerator,
  });

  rateLimiters.dashboardRateLimiter = rateLimit({
    store: getRedisStore('rate-limit:dashboard:standard:'),
    windowMs: rateLimitConfig.dashboard.windowMs,
    max: rateLimitConfig.dashboard.max,
    keyGenerator: rateLimitConfig.dashboard.keyGenerator,
  });

  rateLimiters.dashboardExpensiveRateLimiter = rateLimit({
    store: getRedisStore('rate-limit:dashboard:expensive:'),
    windowMs: rateLimitConfig.dashboardExpensive.windowMs,
    max: rateLimitConfig.dashboardExpensive.max,
    message: rateLimitConfig.dashboardExpensive.message,
    keyGenerator: rateLimitConfig.dashboardExpensive.keyGenerator,
    handler: (req, res) => {
      res.status(429).json({
        statusCode: 429,
        message: 'Too many analytics queries. Try again in 1 hour.',
        retryAfter: req.rateLimit?.resetTime,
      });
    },
  });

  console.log(
    `✅ Rate limiters initialized with ${isRedisClientConnected() ? 'Redis' : 'memory'} store`
  );
}

export const globalRateLimiter: RequestHandler = (req, res, next) => {
  return (
    rateLimiters.globalRateLimiter ||
    ((_req: any, _res: any, next: NextFunction) => next())
  )(req, res, next);
};

export const loginRateLimiter: RequestHandler = (req, res, next) => {
  return (
    rateLimiters.loginRateLimiter ||
    ((_req: any, _res: any, next: NextFunction) => next())
  )(req, res, next);
};

export const createUserRateLimiter: RequestHandler = (req, res, next) => {
  return (
    rateLimiters.createUserRateLimiter ||
    ((_req: any, _res: any, next: NextFunction) => next())
  )(req, res, next);
};

export const updateUserRateLimiter: RequestHandler = (req, res, next) => {
  return (
    rateLimiters.updateUserRateLimiter ||
    ((_req: any, _res: any, next: NextFunction) => next())
  )(req, res, next);
};

export const statusChangeRateLimiter: RequestHandler = (req, res, next) => {
  return (
    rateLimiters.statusChangeRateLimiter ||
    ((_req: any, _res: any, next: NextFunction) => next())
  )(req, res, next);
};

export const deleteUserRateLimiter: RequestHandler = (req, res, next) => {
  return (
    rateLimiters.deleteUserRateLimiter ||
    ((_req: any, _res: any, next: NextFunction) => next())
  )(req, res, next);
};

export const createRecordRateLimiter: RequestHandler = (req, res, next) => {
  return (
    rateLimiters.createRecordRateLimiter ||
    ((_req: any, _res: any, next: NextFunction) => next())
  )(req, res, next);
};

export const updateRecordRateLimiter: RequestHandler = (req, res, next) => {
  return (
    rateLimiters.updateRecordRateLimiter ||
    ((_req: any, _res: any, next: NextFunction) => next())
  )(req, res, next);
};

export const deleteRecordRateLimiter: RequestHandler = (req, res, next) => {
  return (
    rateLimiters.deleteRecordRateLimiter ||
    ((_req: any, _res: any, next: NextFunction) => next())
  )(req, res, next);
};

export const listRecordsRateLimiter: RequestHandler = (req, res, next) => {
  return (
    rateLimiters.listRecordsRateLimiter ||
    ((_req: any, _res: any, next: NextFunction) => next())
  )(req, res, next);
};

export const dashboardRateLimiter: RequestHandler = (req, res, next) => {
  return (
    rateLimiters.dashboardRateLimiter ||
    ((_req: any, _res: any, next: NextFunction) => next())
  )(req, res, next);
};

export const dashboardExpensiveRateLimiter: RequestHandler = (req, res, next) => {
  return (
    rateLimiters.dashboardExpensiveRateLimiter ||
    ((_req: any, _res: any, next: NextFunction) => next())
  )(req, res, next);
};

export { disconnectRedis };
