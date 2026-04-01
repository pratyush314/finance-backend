import type { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  ListUsersQuery,
} from '../validators/user.validator.js';

export class UserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body as CreateUserRequest);
      res.status(201).json(ApiResponse.created(user, 'User created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUser(req.params.id);
      res.json(ApiResponse.success(user));
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.listUsers(req.query as ListUsersQuery);
      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUser(
        req.params.id,
        req.body as UpdateUserRequest
      );
      res.json(ApiResponse.success(user, 201, 'User updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUserRole(
        req.params.id,
        (req.body as UpdateUserRoleRequest).role
      );
      res.json(ApiResponse.success(user, 201, 'User role updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUserStatus(
        req.params.id,
        (req.body as UpdateUserStatusRequest).status
      );
      res.json(ApiResponse.success(user, 201, 'User status updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.deleteUser(req.params.id);
      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
