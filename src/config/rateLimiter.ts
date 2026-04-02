/* eslint-disable @typescript-eslint/no-explicit-any */
export const rateLimitConfig = {
  global: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: any) => {
      return req.path.includes('/health');
    },
  },

  auth: {
    login: {
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Too many login attempts, please try again later.',
      skipSuccessfulRequests: false,
      keyGenerator: (req: any) => req.ip,
    },
  },

  user: {
    create: {
      windowMs: 60 * 60 * 1000,
      max: 3,
      message: 'Too many users created, please try again later.',
      keyGenerator: (req: any) => req.user?.id || req.ip,
    },
    update: {
      windowMs: 60 * 60 * 1000,
      max: 10,
      keyGenerator: (req: any) => req.user?.id || req.ip,
    },
    statusChange: {
      windowMs: 24 * 60 * 60 * 1000,
      max: 10,
      message: 'Too many status changes, please try again tomorrow.',
      keyGenerator: (req: any) => req.user?.id || req.ip,
    },
    delete: {
      windowMs: 24 * 60 * 60 * 1000,
      max: 5,
      message: 'Too many user deletions, please try again tomorrow.',
      keyGenerator: (req: any) => req.user?.id || req.ip,
    },
  },

  record: {
    create: {
      windowMs: 60 * 60 * 1000,
      max: 30,
      keyGenerator: (req: any) => req.user?.id || req.ip,
    },
    update: {
      windowMs: 60 * 60 * 1000,
      max: 20,
      keyGenerator: (req: any) => req.user?.id || req.ip,
    },
    delete: {
      windowMs: 60 * 60 * 1000,
      max: 15,
      message: 'Too many records deleted, please try again later.',
      keyGenerator: (req: any) => req.user?.id || req.ip,
    },
    list: {
      windowMs: 60 * 60 * 1000,
      max: 100,
      keyGenerator: (req: any) => req.user?.id || req.ip,
    },
  },

  dashboard: {
    windowMs: 60 * 60 * 1000,
    max: 60,
    keyGenerator: (req: any) => req.user?.id || req.ip,
  },

  dashboardExpensive: {
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: 'Too many analytics queries, please wait before trying again.',
    keyGenerator: (req: any) => req.user?.id || req.ip,
  },
};
