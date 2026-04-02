import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireActiveUserMiddleware } from '../middlewares/requireActiveUser.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  dashboardOverviewSchema,
  dashboardCategorySchema,
  dashboardMonthlyTrendsSchema,
  dashboardRecentActivitySchema,
} from '../validators/dashboard.validator.js';
import {
  dashboardRateLimiter,
  dashboardExpensiveRateLimiter,
} from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.use(authMiddleware, requireActiveUserMiddleware);

router.get(
  '/overview',
  dashboardRateLimiter,
  authorize('ANALYST', 'ADMIN', 'VIEWER'),
  validate(dashboardOverviewSchema, 'query'),
  (req, res, next) => {
    dashboardController.getOverview(req, res, next);
  }
);

router.get(
  '/category-breakdown',
  dashboardExpensiveRateLimiter,
  authorize('ANALYST', 'ADMIN', 'VIEWER'),
  validate(dashboardCategorySchema, 'query'),
  (req, res, next) => {
    dashboardController.getCategoryBreakdown(req, res, next);
  }
);

router.get(
  '/recent-activity',
  dashboardRateLimiter,
  authorize('ANALYST', 'ADMIN', 'VIEWER'),
  validate(dashboardRecentActivitySchema, 'query'),
  (req, res, next) => {
    dashboardController.getRecentActivity(req, res, next);
  }
);

router.get(
  '/monthly-trends',
  dashboardExpensiveRateLimiter,
  authorize('ANALYST', 'ADMIN', 'VIEWER'),
  validate(dashboardMonthlyTrendsSchema, 'query'),
  (req, res, next) => {
    dashboardController.getMonthlyTrends(req, res, next);
  }
);

export default router;
