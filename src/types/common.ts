/**
 * Common Types
 * Shared type definitions used across the application.
 */

// Pagination
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Search
export interface SearchParams {
  query: string;
  page?: number;
  pageSize?: number;
  filters?: Record<string, string | string[]>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Common entities
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface SlugEntity extends BaseEntity {
  slug: string;
}

export interface AuditableEntity extends BaseEntity {
  created_by: string;
  updated_by: string;
}

// Theme
export type Theme = 'light' | 'dark';

// Toast
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}
