import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { isValidObjectId } from 'mongoose';
import {
  PaginationOptions,
  parsePagination,
  buildPaginationMeta,
  PaginatedResponse,
} from '../utils/pagination.js';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  ListUsersQuery,
} from '../validators/user.validator.js';

export class UserService {
  async createUser(data: CreateUserRequest) {
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      throw ApiError.conflict('Email already in use');
    }

    const user = new User({
      name: data.name,
      email: data.email,
      passwordHash: data.password,
      role: data.role ?? 'VIEWER',
      status: 'ACTIVE',
    });

    await user.save();

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUser(userId: string) {
    if (!isValidObjectId(userId)) {
      throw ApiError.badRequest('Invalid user ID');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async listUsers(query: ListUsersQuery & PaginationOptions) {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);

    const filter: Record<string, unknown> = {};

    if (query.role) {
      filter.role = query.role;
    }

    if (query.status) {
      filter.status = query.status;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ [sortBy || 'createdAt']: sortOrder === 'asc' ? 1 : -1 })
        .lean(),
      User.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(page, limit, total);

    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return { data: formattedUsers, meta } as PaginatedResponse<
      (typeof formattedUsers)[number]
    >;
  }

  async updateUser(userId: string, data: UpdateUserRequest) {
    if (!isValidObjectId(userId)) {
      throw ApiError.badRequest('Invalid user ID');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await User.findOne({ email: data.email });

      if (existingUser) {
        throw ApiError.conflict('Email already in use');
      }
    }

    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.role) user.role = data.role as 'VIEWER' | 'ANALYST' | 'ADMIN';

    await user.save();

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUserRole(userId: string, role: string) {
    if (!isValidObjectId(userId)) {
      throw ApiError.badRequest('Invalid user ID');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.role = role as 'VIEWER' | 'ANALYST' | 'ADMIN';
    await user.save();

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUserStatus(userId: string, status: string) {
    if (!isValidObjectId(userId)) {
      throw ApiError.badRequest('Invalid user ID');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.status = status as 'ACTIVE' | 'INACTIVE';
    await user.save();

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async deleteUser(userId: string) {
    if (!isValidObjectId(userId)) {
      throw ApiError.badRequest('Invalid user ID');
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return { message: 'User deleted successfully' };
  }
}

export const userService = new UserService();
