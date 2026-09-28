/**
 * Pagination Utilities
 * Reusable pagination helpers for API responses.
 */

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationInput {
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

/**
 * Normalize pagination parameters
 */
export function normalizePagination(input?: PaginationInput): { page: number; pageSize: number } {
  const page = Math.max(1, input?.page ?? DEFAULT_PAGE);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, input?.pageSize ?? DEFAULT_PAGE_SIZE));
  return { page, pageSize };
}

/**
 * Build pagination metadata
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Create a paginated result
 */
export function paginate<T>(items: T[], total: number, page: number, pageSize: number): PaginatedResult<T> {
  return {
    data: items,
    meta: buildPaginationMeta(total, page, pageSize),
  };
}

/**
 * Calculate offset from page number
 */
export function pageToOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}
