import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/apiError.js';

export function validate(
  schema: ZodSchema,
  location: 'body' | 'query' | 'params' = 'body'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate =
        location === 'body' ? req.body : location === 'query' ? req.query : req.params;

      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: String(err.path[0] ?? 'unknown'),
          message: err.message,
        }));
        return next(ApiError.badRequest('Validation failed', errors));
      }

      if (location === 'body') {
        req.body = result.data;
      } else if (location === 'query') {
        req.query = result.data;
      } else {
        req.params = result.data as Record<string, string>;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
