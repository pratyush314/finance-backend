import type { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import type {
  DashboardOverviewQuery,
  DashboardCategoryQuery,
  DashboardMonthlyTrendsQuery,
  DashboardRecentActivityQuery,
} from '../validators/dashboard.validator.js';

export class DashboardController {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as DashboardOverviewQuery;
      const overview = await dashboardService.getOverview(query.from, query.to);
      res.json(ApiResponse.success(overview));
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBreakdown(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as DashboardCategoryQuery;
      const breakdown = await dashboardService.getCategoryBreakdown(
        query.from,
        query.to,
        query.type
      );
      res.json(ApiResponse.success(breakdown));
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as DashboardRecentActivityQuery;
      const limit = (query.limit as number) ?? 10;
      const activity = await dashboardService.getRecentActivity(limit);
      res.json(ApiResponse.success(activity));
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as DashboardMonthlyTrendsQuery;
      const months = (query.months as number) ?? 1;
      const trends = await dashboardService.getMonthlyTrends(months);
      res.json(ApiResponse.success(trends));
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
