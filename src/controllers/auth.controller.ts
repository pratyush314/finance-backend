import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not found in request');
      }

      const user = await authService.getCurrentUser(req.user.id);
      res.json(ApiResponse.success(user));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
