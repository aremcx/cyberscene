/**
 * Base Service
 * Provides common patterns for all services: error handling,
 * logging, authorization, and response formatting.
 */

import { AppError, toAppError, ErrorCode } from '../lib/errors';
import { logger } from '../lib/logger';
import { normalizePagination, type PaginatedResult, paginate } from '../lib/pagination';
import type { PaginationInput } from '../lib/pagination';
import type { AuthContext } from '../lib/authorization';
import { db, DatabaseError } from '../db/store';
import { AuditAction } from '../db/schema';

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: Record<string, unknown>;
}

/**
 * Wrap a service operation with error handling and logging
 */
export async function withServiceHandler<T>(
  operation: string,
  fn: () => T,
  ctx?: AuthContext
): Promise<ApiResponse<T>> {
  const logCtx = { operation, userId: ctx?.userId };
  logger.service.info(`Starting: ${operation}`, logCtx);

  try {
    const data = fn();
    logger.service.info(`Completed: ${operation}`, logCtx);
    return { success: true, data };
  } catch (error) {
    const appError = toAppError(error);
    logger.service.error(`Failed: ${operation} - ${appError.message}`, {
      ...logCtx,
      code: appError.code,
      statusCode: appError.statusCode,
    });
    return {
      success: false,
      error: {
        code: appError.code,
        message: appError.message,
        ...(appError.details && { details: appError.details }),
      },
    };
  }
}

/**
 * Convert a database list result to a paginated API response
 */
export function toPaginatedResult<T>(
  result: { data: T[]; total: number },
  pagination?: PaginationInput
): PaginatedResult<T> {
  const { page, pageSize } = normalizePagination(pagination);
  return paginate(result.data, result.total, page, pageSize);
}

/**
 * Create an audit log entry for an operation
 */
export function audit(
  action: AuditAction,
  entityType: string,
  entityId: string | null,
  userId: string | null,
  details?: Record<string, unknown>
): void {
  db.createAuditLog(action, entityType, entityId, userId, details);
}

/**
 * Handle database errors and convert them to AppErrors
 */
export function handleDatabaseError(error: unknown): never {
  if (error instanceof DatabaseError) {
    switch (error.code) {
      case 'NOT_FOUND':
        throw new AppError(error.message, ErrorCode.NOT_FOUND, 404);
      case 'UNIQUE_CONSTRAINT':
        throw new AppError(error.message, ErrorCode.CONFLICT, 409);
      case 'REFERENCE_NOT_FOUND':
        throw new AppError(error.message, ErrorCode.BAD_REQUEST, 400);
      case 'FORBIDDEN':
        throw new AppError(error.message, ErrorCode.FORBIDDEN, 403);
      default:
        throw new AppError(error.message, ErrorCode.DATABASE_ERROR, 500);
    }
  }
  throw toAppError(error);
}
