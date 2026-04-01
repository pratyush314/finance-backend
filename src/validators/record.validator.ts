import { z } from 'zod';

const typeEnum = z.enum(['INCOME', 'EXPENSE']);

export const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: typeEnum,
  category: z.string().min(1, 'Category is required').max(50),
  date: z.string().datetime().or(z.string().date()),
  notes: z.string().max(500).optional(),
});

export const updateRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  type: typeEnum.optional(),
  category: z.string().min(1, 'Category is required').max(50).optional(),
  date: z.string().datetime().or(z.string().date()).optional(),
  notes: z.string().max(500).optional(),
});

export const recordIdSchema = z.object({
  id: z.string().min(1, 'Record ID is required'),
});

export const listRecordsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  type: typeEnum.optional(),
  category: z.string().optional(),
  from: z.string().datetime().or(z.string().date()).optional(),
  to: z.string().datetime().or(z.string().date()).optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateRecordRequest = z.infer<typeof createRecordSchema>;
export type UpdateRecordRequest = z.infer<typeof updateRecordSchema>;
export type ListRecordsQuery = z.infer<typeof listRecordsSchema>;
