import { z } from 'zod';

const roleEnum = z.enum(['VIEWER', 'ANALYST', 'ADMIN']);
const statusEnum = z.enum(['ACTIVE', 'INACTIVE']);

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: roleEnum.optional().default('VIEWER'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: roleEnum.optional(),
});

export const updateUserRoleSchema = z.object({
  role: roleEnum,
});

export const updateUserStatusSchema = z.object({
  status: statusEnum,
});

export const userIdSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  role: roleEnum.optional(),
  status: statusEnum.optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'role', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
export type UpdateUserRoleRequest = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserStatusRequest = z.infer<typeof updateUserStatusSchema>;
export type ListUsersQuery = z.infer<typeof listUsersSchema>;
