export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors: Record<string, string>[] = []
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(message: string, errors?: Record<string, string>[]) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message: string, errors?: Record<string, string>[]) {
    return new ApiError(404, message, errors);
  }

  static conflict(message: string = 'Conflict') {
    return new ApiError(409, message);
  }

  static unprocessableEntity(message: string, errors?: Record<string, string>[]) {
    return new ApiError(422, message, errors);
  }

  static internalServerError(message: string = 'Internal server error') {
    return new ApiError(500, message);
  }
}
