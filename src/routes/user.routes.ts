import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireActiveUserMiddleware } from '../middlewares/requireActiveUser.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  userIdSchema,
  listUsersSchema,
} from '../validators/user.validator.js';
import {
  createUserRateLimiter,
  updateUserRateLimiter,
  statusChangeRateLimiter,
  deleteUserRateLimiter,
} from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.use(authMiddleware, requireActiveUserMiddleware);

router.post(
  '/',
  createUserRateLimiter,
  authorize('ADMIN'),
  validate(createUserSchema),
  (req, res, next) => {
    userController.createUser(req, res, next);
  }
);

router.get(
  '/',
  authorize('ADMIN'),
  validate(listUsersSchema, 'query'),
  (req, res, next) => {
    userController.listUsers(req, res, next);
  }
);

router.get(
  '/:id',
  authorize('ADMIN', 'ANALYST', 'VIEWER'),
  validate(userIdSchema, 'params'),
  (req, res, next) => {
    userController.getUser(req, res, next);
  }
);

router.patch(
  '/:id',
  updateUserRateLimiter,
  authorize('ADMIN'),
  validate(userIdSchema, 'params'),
  validate(updateUserSchema),
  (req, res, next) => {
    userController.updateUser(req, res, next);
  }
);

router.patch(
  '/:id/role',
  authorize('ADMIN'),
  validate(userIdSchema, 'params'),
  validate(updateUserRoleSchema),
  (req, res, next) => {
    userController.updateUserRole(req, res, next);
  }
);

router.patch(
  '/:id/status',
  statusChangeRateLimiter,
  authorize('ADMIN'),
  validate(userIdSchema, 'params'),
  validate(updateUserStatusSchema),
  (req, res, next) => {
    userController.updateUserStatus(req, res, next);
  }
);

router.delete(
  '/:id',
  deleteUserRateLimiter,
  authorize('ADMIN'),
  validate(userIdSchema, 'params'),
  (req, res, next) => {
    userController.deleteUser(req, res, next);
  }
);

export default router;
