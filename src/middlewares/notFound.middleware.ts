import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';

export function notFoundMiddleware(req: Request, res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
}
