/* eslint-disable @typescript-eslint/no-explicit-any */
import { FinancialRecord } from '../models/FinancialRecord.js';
import { isValidDateString, getStartOfDay, getEndOfDay } from '../utils/dateHelpers.js';
import { ApiError } from '../utils/apiError.js';

export interface DashboardOverview {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  recordCount: number;
}

export interface CategoryBreakdown {
  category: string;
  income: number;
  expense: number;
  net: number;
}

export interface RecentActivity {
  id: string;
  amount: number;
  type: string;
  category: string;
  date: Date;
  createdAt: Date;
  createdBy: string;
  user: {
    name: string;
    email: string;
  };
}

export interface MonthlyTrend {
  year: number;
  month: number;
  income: number;
  expense: number;
  net: number;
}

export class DashboardService {
  async getOverview(from?: string, to?: string): Promise<DashboardOverview> {
    const filter: Record<string, unknown> = {};

    if (from || to) {
      filter.date = {};

      if (from) {
        if (!isValidDateString(from)) {
          throw ApiError.badRequest('Invalid "from" date format');
        }
        (filter.date as any).$gte = getStartOfDay(new Date(from));
      }

      if (to) {
        if (!isValidDateString(to)) {
          throw ApiError.badRequest('Invalid "to" date format');
        }
        (filter.date as any).$lte = getEndOfDay(new Date(to));
      }
    }

    const records = await FinancialRecord.find(filter).select('amount type');

    const totalIncome = records
      .filter((r) => r.type === 'INCOME')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpense = records
      .filter((r) => r.type === 'EXPENSE')
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      recordCount: records.length,
    };
  }

  async getCategoryBreakdown(
    from?: string,
    to?: string,
    type?: string
  ): Promise<CategoryBreakdown[]> {
    const filter: Record<string, unknown> = {};

    if (type) {
      filter.type = type;
    }

    if (from || to) {
      filter.date = {};

      if (from) {
        if (!isValidDateString(from)) {
          throw ApiError.badRequest('Invalid "from" date format');
        }
        (filter.date as any).$gte = getStartOfDay(new Date(from));
      }

      if (to) {
        if (!isValidDateString(to)) {
          throw ApiError.badRequest('Invalid "to" date format');
        }
        (filter.date as any).$lte = getEndOfDay(new Date(to));
      }
    }

    const records = await FinancialRecord.find(filter).select('amount type category');

    const categoryMap = new Map<string, { income: number; expense: number }>();

    records.forEach((record) => {
      const key = record.category;
      if (!categoryMap.has(key)) {
        categoryMap.set(key, { income: 0, expense: 0 });
      }

      const cat = categoryMap.get(key)!;
      if (record.type === 'INCOME') {
        cat.income += record.amount;
      } else {
        cat.expense += record.amount;
      }
    });

    const breakdown: CategoryBreakdown[] = [];
    categoryMap.forEach((value, category) => {
      breakdown.push({
        category,
        income: value.income,
        expense: value.expense,
        net: value.income - value.expense,
      });
    });

    return breakdown.sort(
      (a, b) => b.net - a.net || a.category.localeCompare(b.category)
    );
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const records = await FinancialRecord.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return records.map((record: any) => ({
      id: record._id.toString(),
      amount: record.amount,
      type: record.type,
      category: record.category,
      date: record.date,
      createdAt: record.createdAt,
      createdBy: record.createdBy._id.toString(),
      user: {
        name: record.createdBy.name,
        email: record.createdBy.email,
      },
    }));
  }

  async getMonthlyTrends(months: number = 1): Promise<MonthlyTrend[]> {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - months + 1, 1);

    const records = await FinancialRecord.find({
      date: { $gte: startDate },
    })
      .select('amount type date')
      .sort({ date: 1 })
      .lean();

    const monthMap = new Map<string, { income: number; expense: number }>();

    records.forEach((record: any) => {
      const year = record.date.getFullYear();
      const month = record.date.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;

      if (!monthMap.has(key)) {
        monthMap.set(key, { income: 0, expense: 0 });
      }

      const m = monthMap.get(key)!;
      if (record.type === 'INCOME') {
        m.income += record.amount;
      } else {
        m.expense += record.amount;
      }
    });

    const trends: MonthlyTrend[] = [];
    monthMap.forEach((value, key) => {
      const [year, month] = key.split('-').map(Number);
      trends.push({
        year,
        month,
        income: value.income,
        expense: value.expense,
        net: value.income - value.expense,
      });
    });

    return trends;
  }
}

export const dashboardService = new DashboardService();
