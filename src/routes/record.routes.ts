import { Router } from 'express';
import { recordController } from '../controllers/record.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireActiveUserMiddleware } from '../middlewares/requireActiveUser.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createRecordSchema,
  updateRecordSchema,
  recordIdSchema,
  listRecordsSchema,
} from '../validators/record.validator.js';
import {
  createRecordRateLimiter,
  listRecordsRateLimiter,
  updateRecordRateLimiter,
  deleteRecordRateLimiter,
} from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.use(authMiddleware, requireActiveUserMiddleware);

router.post(
  '/',
  createRecordRateLimiter,
  authorize('ADMIN', 'ANALYST'),
  validate(createRecordSchema),
  (req, res, next) => {
    recordController.createRecord(req, res, next);
  }
);

router.get(
  '/',
  listRecordsRateLimiter,
  authorize('ADMIN', 'ANALYST'),
  validate(listRecordsSchema, 'query'),
  (req, res, next) => {
    recordController.listRecords(req, res, next);
  }
);

router.get(
  '/:id',
  authorize('ADMIN', 'ANALYST'),
  validate(recordIdSchema, 'params'),
  (req, res, next) => {
    recordController.getRecord(req, res, next);
  }
);

router.patch(
  '/:id',
  updateRecordRateLimiter,
  authorize('ADMIN'),
  validate(recordIdSchema, 'params'),
  validate(updateRecordSchema),
  (req, res, next) => {
    recordController.updateRecord(req, res, next);
  }
);

router.delete(
  '/:id',
  deleteRecordRateLimiter,
  authorize('ADMIN'),
  validate(recordIdSchema, 'params'),
  (req, res, next) => {
    recordController.deleteRecord(req, res, next);
  }
);

export default router;
