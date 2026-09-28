/**
 * Application Error Classes
 * Centralized error hierarchy for consistent error handling.
 */

export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',

  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Base application error
 */
export class AppError extends Error {
  code: ErrorCode;
  statusCode: number;
  severity: ErrorSeverity;
  details?: Record<string, unknown>;
  isOperational: boolean;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.severity = severity;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

/**
 * Validation error - thrown when input validation fails
 */
export class ValidationError extends AppError {
  fields: Record<string, string[]>;

  constructor(message: string, fields: Record<string, string[]>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, ErrorSeverity.INFO, { fields });
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id "${id}" not found` : `${resource} not found`;
    super(message, ErrorCode.NOT_FOUND, 404, ErrorSeverity.INFO);
    this.name = 'NotFoundError';
  }
}

/**
 * Unauthorized error - user not authenticated
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, ErrorCode.UNAUTHORIZED, 401, ErrorSeverity.WARNING);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden error - user lacks permission
 */
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, ErrorCode.FORBIDDEN, 403, ErrorSeverity.WARNING);
    this.name = 'ForbiddenError';
  }
}

/**
 * Conflict error - resource already exists
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.CONFLICT, 409, ErrorSeverity.WARNING);
    this.name = 'ConflictError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, ErrorCode.RATE_LIMITED, 429, ErrorSeverity.WARNING);
    this.name = 'RateLimitError';
  }
}

/**
 * Convert any error to an AppError
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof Error) {
    return new AppError(error.message, ErrorCode.INTERNAL_ERROR, 500, ErrorSeverity.ERROR);
  }

  return new AppError('An unexpected error occurred', ErrorCode.INTERNAL_ERROR, 500, ErrorSeverity.CRITICAL);
}
