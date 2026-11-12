/**
 * Service Layer - Base API Service
 * Provides a typed, centralized HTTP client for API operations.
 * Currently configured for Supabase but designed to be swappable.
 */

import { supabase } from '../lib/supabase';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types';

/**
 * Generic list query with pagination
 */
export async function fetchList<T>(
  table: string,
  params?: PaginationParams & { select?: string; filter?: Record<string, unknown>; order?: { column: string; ascending: boolean } }
): Promise<PaginatedResponse<T>> {
  const { page = 1, pageSize = 12, select = '*', filter, order } = params || {};
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from(table).select(select, { count: 'exact' });

  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value as string);
    });
  }

  if (order) {
    query = query.order(order.column, { ascending: order.ascending });
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: (data || []) as T[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Fetch a single record by ID
 */
export async function fetchById<T>(table: string, id: string, select = '*'): Promise<T | null> {
  const { data, error } = await supabase.from(table).select(select).eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(error.message);
  }

  return data as T;
}

/**
 * Fetch a single record by slug
 */
export async function fetchBySlug<T>(table: string, slug: string, select = '*'): Promise<T | null> {
  const { data, error } = await supabase.from(table).select(select).eq('slug', slug).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return data as T;
}

/**
 * Create a new record
 */
export async function createRecord<T>(table: string, data: Partial<T>): Promise<T> {
  const { data: record, error } = await supabase
    .from(table)
    .insert(data as Record<string, unknown>)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return record as T;
}

/**
 * Update a record
 */
export async function updateRecord<T>(table: string, id: string, data: Partial<T>): Promise<T> {
  const { data: record, error } = await supabase
    .from(table)
    .update(data as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return record as T;
}

/**
 * Delete a record
 */
export async function deleteRecord(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Full-text search
 */
export async function searchTable<T>(
  table: string,
  query: string,
  searchColumn: string,
  params?: PaginationParams
): Promise<PaginatedResponse<T>> {
  const { page = 1, pageSize = 12 } = params || {};
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact' })
    .textSearch(searchColumn, query)
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: (data || []) as T[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Wrap a service call in a standard API response
 */
export async function withApiResponse<T>(
  fn: () => Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
