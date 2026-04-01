import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, string>[];
  [key: string]: unknown;
}

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error: ErrorResponse = {
    statusCode: 500,
    message: 'Internal server error',
  };

  if (err instanceof ApiError) {
    error.statusCode = err.statusCode;
    error.message = err.message;
    if (err.errors.length > 0) {
      error.errors = err.errors;
    }
  } else if (err instanceof Error) {
    error.message = err.message;
  }

  if (env.isDevelopment) {
    error.stack = err instanceof Error ? err.stack : undefined;
  }

  res.status(error.statusCode).json(error);
}
