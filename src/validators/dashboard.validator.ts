import { z } from 'zod';

export const dashboardOverviewSchema = z.object({
  from: z.string().datetime().or(z.string().date()).optional(),
  to: z.string().datetime().or(z.string().date()).optional(),
});

export const dashboardCategorySchema = z.object({
  from: z.string().datetime().or(z.string().date()).optional(),
  to: z.string().datetime().or(z.string().date()).optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
});

export const dashboardMonthlyTrendsSchema = z.object({
  months: z.coerce.number().int().positive().max(24).optional(),
});

export const dashboardRecentActivitySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export type DashboardOverviewQuery = z.infer<typeof dashboardOverviewSchema>;
export type DashboardCategoryQuery = z.infer<typeof dashboardCategorySchema>;
export type DashboardMonthlyTrendsQuery = z.infer<typeof dashboardMonthlyTrendsSchema>;
export type DashboardRecentActivityQuery = z.infer<typeof dashboardRecentActivitySchema>;
