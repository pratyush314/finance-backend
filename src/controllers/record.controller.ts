import type { Request, Response, NextFunction } from 'express';
import { recordService } from '../services/record.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import type {
  CreateRecordRequest,
  UpdateRecordRequest,
  ListRecordsQuery,
} from '../validators/record.validator.js';

export class RecordController {
  async createRecord(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('User not found in request');
      }

      const record = await recordService.createRecord(
        req.body as CreateRecordRequest,
        req.user.id
      );
      res.status(201).json(ApiResponse.created(record, 'Record created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await recordService.getRecord(req.params.id);
      res.json(ApiResponse.success(record));
    } catch (error) {
      next(error);
    }
  }

  async listRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recordService.listRecords(req.query as ListRecordsQuery);
      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async updateRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await recordService.updateRecord(
        req.params.id,
        req.body as UpdateRecordRequest
      );
      res.json(ApiResponse.success(record, 201, 'Record updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recordService.deleteRecord(req.params.id);
      res.json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  }
}

export const recordController = new RecordController();
