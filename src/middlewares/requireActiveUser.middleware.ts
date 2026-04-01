import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';

export function requireActiveUserMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return next(ApiError.unauthorized('User not authenticated'));
  }

  if (req.user.status !== 'ACTIVE') {
    return next(ApiError.forbidden('User account is inactive. Please contact support.'));
  }

  next();
}
