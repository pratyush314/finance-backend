export class ApiResponse<T = unknown> {
  constructor(
    public statusCode: number,
    public data: T,
    public message: string = 'Success'
  ) {}

  static success<D>(data: D, statusCode: number = 200, message: string = 'Success') {
    return new ApiResponse(statusCode, data, message);
  }

  static created<D>(data: D, message: string = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  static noContent() {
    return new ApiResponse(204, null, 'No content');
  }
}
