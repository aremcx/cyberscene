/**
 * Article Service
 * Business logic for article CRUD operations with validation,
 * authorization, and audit logging.
 */

import { db } from '../db/store';
import { validators } from '../lib/validation';
import { NotFoundError, ForbiddenError, ValidationError } from '../lib/errors';
import { logger } from '../lib/logger';
import {
  requirePermission, requireAuth, requireCanEditArticle, requireCanDeleteArticle,
  PERMISSIONS, type AuthContext,
} from '../lib/authorization';
import { withServiceHandler, toPaginatedResult, audit, handleDatabaseError } from './base';
import { AuditAction, ArticleStatus, CommentStatus, type Article, type CreateArticleInput, type UpdateArticleInput, type ArticleFilters, type SortParams } from '../db/schema';
import type { PaginationInput } from '../lib/pagination';

/**
 * Article with resolved relations
 */
export interface ArticleWithRelations extends Article {
  author: { id: string; displayName: string; avatarUrl: string | null } | null;
  category: { id: string; name: string; slug: string } | null;
  tags: { id: string; name: string; slug: string }[];
  commentCount: number;
}

/**
 * Get a single article by ID with relations
 */
export function getArticleById(id: string): ArticleWithRelations | null {
  const article = db.getArticleById(id);
  if (!article) return null;
  return resolveArticleRelations(article);
}

/**
 * Get a single article by slug with relations
 */
export function getArticleBySlug(slug: string): ArticleWithRelations | null {
  const article = db.getArticleBySlug(slug);
  if (!article) return null;
  return resolveArticleRelations(article);
}

/**
 * List articles with pagination, filtering, and sorting
 */
export function listArticles(
  pagination?: PaginationInput,
  sort?: SortParams,
  filters?: ArticleFilters
) {
  const { page, pageSize } = { page: pagination?.page ?? 1, pageSize: pagination?.pageSize ?? 12 };
  const result = db.listArticles({ page, pageSize }, sort, filters);

  const articlesWithRelations = result.data.map(resolveArticleRelations);
  return toPaginatedResult({ data: articlesWithRelations, total: result.total }, pagination);
}

/**
 * Create a new article
 */
export function createArticle(input: CreateArticleInput, ctx: AuthContext) {
  requirePermission(ctx, PERMISSIONS.CONTENT_CREATE);

  // Validate input
  validators.createArticle.validateOrThrow(input as Parameters<typeof validators.createArticle.validate>[0]);

  try {
    const article = db.createArticle(input);

    // Audit log
    audit(AuditAction.CREATE, 'article', article.id, ctx.userId, {
      title: article.title,
      status: article.status,
    });

    logger.service.info(`Article created: ${article.id}`, { userId: ctx.userId });
    return resolveArticleRelations(article);
  } catch (error) {
    handleDatabaseError(error);
  }
}

/**
 * Update an article
 */
export function updateArticle(id: string, input: UpdateArticleInput, ctx: AuthContext) {
  requireAuth(ctx);

  const existing = db.getArticleById(id);
  if (!existing) throw new NotFoundError('Article', id);

  // Check authorization
  requireCanEditArticle(ctx, existing.authorId);

  // If publishing, require publish permission
  if (input.status === ArticleStatus.PUBLISHED && existing.status !== ArticleStatus.PUBLISHED) {
    requirePermission(ctx, PERMISSIONS.CONTENT_PUBLISH);
    input = { ...input, publishedAt: input.publishedAt ?? new Date().toISOString() };
  }

  // If featuring, require feature permission
  if (input.isFeatured === true && !existing.isFeatured) {
    requirePermission(ctx, PERMISSIONS.CONTENT_FEATURE);
  }

  try {
    const article = db.updateArticle(id, input);

    audit(AuditAction.UPDATE, 'article', article.id, ctx.userId, {
      changes: Object.keys(input).filter(k => k !== 'updatedById'),
    });

    logger.service.info(`Article updated: ${article.id}`, { userId: ctx.userId });
    return resolveArticleRelations(article);
  } catch (error) {
    handleDatabaseError(error);
  }
}

/**
 * Delete an article
 */
export function deleteArticle(id: string, ctx: AuthContext): void {
  requireAuth(ctx);

  const existing = db.getArticleById(id);
  if (!existing) throw new NotFoundError('Article', id);

  requireCanDeleteArticle(ctx, existing.authorId);

  try {
    db.deleteArticle(id);

    audit(AuditAction.DELETE, 'article', id, ctx.userId, {
      title: existing.title,
    });

    logger.service.info(`Article deleted: ${id}`, { userId: ctx.userId });
  } catch (error) {
    handleDatabaseError(error);
  }
}

/**
 * Publish an article (shortcut for status update)
 */
export function publishArticle(id: string, ctx: AuthContext) {
  return updateArticle(id, { status: ArticleStatus.PUBLISHED, updatedById: ctx.userId! }, ctx);
}

/**
 * Archive an article
 */
export function archiveArticle(id: string, ctx: AuthContext) {
  return updateArticle(id, { status: ArticleStatus.ARCHIVED, updatedById: ctx.userId! }, ctx);
}

/**
 * Increment view count
 */
export function incrementViewCount(id: string): void {
  db.incrementViewCount(id);
}

/**
 * Set tags for an article
 */
export function setArticleTags(articleId: string, tagIds: string[], ctx: AuthContext): void {
  requireAuth(ctx);

  const article = db.getArticleById(articleId);
  if (!article) throw new NotFoundError('Article', articleId);

  // Remove existing tags
  const currentTags = db.getArticleTags(articleId);
  for (const tag of currentTags) {
    db.removeTagFromArticle(articleId, tag.id);
  }

  // Add new tags
  for (const tagId of tagIds) {
    try {
      db.addTagToArticle(articleId, tagId);
    } catch {
      // Skip invalid tag IDs silently
    }
  }
}

// ============================================
// HELPERS
// ============================================

function resolveArticleRelations(article: Article): ArticleWithRelations {
  const author = db.getUserById(article.authorId);
  const category = article.categoryId ? db.getCategoryById(article.categoryId) : null;
  const tags = db.getArticleTags(article.id);
  const { data: comments } = db.listComments(undefined, undefined, { articleId: article.id, status: CommentStatus.APPROVED });

  return {
    ...article,
    author: author ? { id: author.id, displayName: author.displayName, avatarUrl: author.avatarUrl } : null,
    category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
    tags: tags.map(t => ({ id: t.id, name: t.name, slug: t.slug })),
    commentCount: comments.length,
  };
}
