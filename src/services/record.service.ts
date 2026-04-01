/* eslint-disable @typescript-eslint/no-explicit-any */
import { FinancialRecord } from '../models/FinancialRecord.js';
import { ApiError } from '../utils/apiError.js';
import { isValidObjectId } from 'mongoose';
import {
  PaginationOptions,
  parsePagination,
  buildPaginationMeta,
  PaginatedResponse,
} from '../utils/pagination.js';
import { isValidDateString, getStartOfDay, getEndOfDay } from '../utils/dateHelpers.js';
import type {
  CreateRecordRequest,
  UpdateRecordRequest,
  ListRecordsQuery,
} from '../validators/record.validator.js';

export class RecordService {
  async createRecord(data: CreateRecordRequest, userId: string) {
    if (!isValidObjectId(userId)) {
      throw ApiError.badRequest('Invalid user ID');
    }

    const record = new FinancialRecord({
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: new Date(data.date),
      notes: data.notes,
      createdBy: userId,
    });

    await record.save();

    return {
      id: record._id.toString(),
      amount: record.amount,
      type: record.type,
      category: record.category,
      date: record.date,
      notes: record.notes,
      createdBy: record.createdBy.toString(),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async getRecord(recordId: string) {
    if (!isValidObjectId(recordId)) {
      throw ApiError.badRequest('Invalid record ID');
    }

    const record = await FinancialRecord.findById(recordId).populate(
      'createdBy',
      'name email'
    );

    if (!record) {
      throw ApiError.notFound('Record not found');
    }

    const creator = record.createdBy as any;
    return {
      id: record._id.toString(),
      amount: record.amount,
      type: record.type,
      category: record.category,
      date: record.date,
      notes: record.notes,
      createdBy: record.createdBy.toString(),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      user: {
        id: creator._id.toString(),
        name: creator.name,
        email: creator.email,
      },
    };
  }

  async listRecords(query: ListRecordsQuery & PaginationOptions) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);

    const filter: Record<string, unknown> = {};

    // Filter by type
    if (query.type) {
      filter.type = query.type;
    }

    // Filter by category
    if (query.category) {
      filter.category = { $regex: query.category, $options: 'i' };
    }

    // Filter by date range
    if (query.from || query.to) {
      filter.date = {};

      if (query.from) {
        if (!isValidDateString(query.from)) {
          throw ApiError.badRequest('Invalid "from" date format');
        }
        (filter.date as any).$gte = getStartOfDay(new Date(query.from));
      }

      if (query.to) {
        if (!isValidDateString(query.to)) {
          throw ApiError.badRequest('Invalid "to" date format');
        }
        (filter.date as any).$lte = getEndOfDay(new Date(query.to));
      }
    }

    const [records, total] = await Promise.all([
      FinancialRecord.find(filter)
        .populate('createdBy', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ [sortBy || 'date']: sortOrder === 'asc' ? 1 : -1 })
        .lean(),
      FinancialRecord.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(page, limit, total);

    const formattedRecords = records.map((record: any) => ({
      id: record._id.toString(),
      amount: record.amount,
      type: record.type,
      category: record.category,
      date: record.date,
      notes: record.notes,
      createdBy: record.createdBy._id.toString(),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      user: {
        id: record.createdBy._id.toString(),
        name: record.createdBy.name,
        email: record.createdBy.email,
      },
    }));

    return { data: formattedRecords, meta } as PaginatedResponse<
      (typeof formattedRecords)[number]
    >;
  }

  async updateRecord(recordId: string, data: UpdateRecordRequest) {
    if (!isValidObjectId(recordId)) {
      throw ApiError.badRequest('Invalid record ID');
    }

    const record = await FinancialRecord.findById(recordId);

    if (!record) {
      throw ApiError.notFound('Record not found');
    }

    if (data.amount !== undefined) record.amount = data.amount;
    if (data.type) record.type = data.type as any;
    if (data.category) record.category = data.category;
    if (data.date) record.date = new Date(data.date);
    if (data.notes !== undefined) record.notes = data.notes;

    await record.save();

    return {
      id: record._id.toString(),
      amount: record.amount,
      type: record.type,
      category: record.category,
      date: record.date,
      notes: record.notes,
      createdBy: record.createdBy.toString(),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async deleteRecord(recordId: string) {
    if (!isValidObjectId(recordId)) {
      throw ApiError.badRequest('Invalid record ID');
    }

    const record = await FinancialRecord.findByIdAndDelete(recordId);

    if (!record) {
      throw ApiError.notFound('Record not found');
    }

    return { message: 'Record deleted successfully' };
  }
}

export const recordService = new RecordService();
