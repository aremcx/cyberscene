/**
 * Database Schema Types
 * TypeScript types that mirror the Prisma schema.
 * These are the canonical types for all database entities.
 */

// ============================================
// ENUMS
// ============================================

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  AUTHOR = 'author',
  CONTRIBUTOR = 'contributor',
  MODERATOR = 'moderator',
  USER = 'user',
}

export enum ArticleStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export enum ContentType {
  ARTICLE = 'article',
  TUTORIAL = 'tutorial',
  NEWS = 'news',
  RESEARCH = 'research',
  THREAT_INTEL = 'threat_intel',
  TOOL_REVIEW = 'tool_review',
  CASE_STUDY = 'case_study',
  INTERVIEW = 'interview',
  CAREER = 'career',
  SECURITY_AWARENESS = 'security_awareness',
  OPINION = 'opinion',
}

export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum NotificationType {
  COMMENT_REPLY = 'comment_reply',
  ARTICLE_PUBLISHED = 'article_published',
  MENTION = 'mention',
  SYSTEM = 'system',
  ROLE_CHANGE = 'role_change',
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  ROLE_CHANGE = 'role_change',
  PERMISSION_CHANGE = 'permission_change',
  PASSWORD_RESET = 'password_reset',
}

// ============================================
// MODELS
// ============================================

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoleRecord {
  id: string;
  name: Role;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  module: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string | null;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  contentType: ContentType;
  status: ArticleStatus;
  difficulty: Difficulty | null;
  featuredImage: string | null;
  authorId: string;
  categoryId: string | null;
  readingTimeMinutes: number;
  viewCount: number;
  publishedAt: string | null;
  scheduledAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  updatedById: string;
}

export interface ArticleRevision {
  id: string;
  articleId: string;
  revisionNumber: number;
  title: string;
  excerpt: string;
  content: string;
  status: ArticleStatus;
  changedById: string;
  changeNote: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleTag {
  articleId: string;
  tagId: string;
}

export interface Comment {
  id: string;
  content: string;
  status: CommentStatus;
  articleId: string;
  authorId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  articleId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  link: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  userId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

// ============================================
// INPUT TYPES (for create/update operations)
// ============================================

export interface CreateArticleInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  contentType?: ContentType;
  status?: ArticleStatus;
  difficulty?: Difficulty | null;
  featuredImage?: string | null;
  authorId: string;
  categoryId?: string | null;
  readingTimeMinutes?: number;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isFeatured?: boolean;
  createdById: string;
  updatedById: string;
}

export interface UpdateArticleInput {
  title?: string;
  excerpt?: string;
  content?: string;
  contentType?: ContentType;
  status?: ArticleStatus;
  difficulty?: Difficulty | null;
  featuredImage?: string | null;
  categoryId?: string | null;
  readingTimeMinutes?: number;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isFeatured?: boolean;
  updatedById: string;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface CreateCommentInput {
  content: string;
  articleId: string;
  authorId: string;
  parentId?: string | null;
  status?: CommentStatus;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
}

export interface CreateTagInput {
  name: string;
  slug: string;
}

// ============================================
// QUERY TYPES
// ============================================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ArticleFilters {
  status?: ArticleStatus;
  contentType?: ContentType;
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  isFeatured?: boolean;
  search?: string;
}

export interface CommentFilters {
  articleId?: string;
  authorId?: string;
  status?: CommentStatus;
  parentId?: string | null;
}
