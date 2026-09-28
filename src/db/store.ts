/**
 * In-Memory Database Store
 * Implements a full in-memory database with CRUD operations,
 * filtering, sorting, and pagination. Mirrors what Prisma would provide.
 */

import type {
  User, RoleRecord, Permission, UserRole, RolePermission,
  Article, Category, Tag, ArticleTag, Comment, Bookmark,
  Notification, AuditLog,
  CreateArticleInput, UpdateArticleInput, CreateUserInput,
  CreateCommentInput, CreateCategoryInput, CreateTagInput,
  PaginationParams, SortParams, ArticleFilters, CommentFilters,
  AuditAction,
} from './schema';
import { generateId } from '../lib/utils';

// ============================================
// STORE STATE
// ============================================

interface DatabaseState {
  users: Map<string, User>;
  roles: Map<string, RoleRecord>;
  permissions: Map<string, Permission>;
  userRoles: UserRole[];
  rolePermissions: RolePermission[];
  articles: Map<string, Article>;
  categories: Map<string, Category>;
  tags: Map<string, Tag>;
  articleTags: ArticleTag[];
  comments: Map<string, Comment>;
  bookmarks: Map<string, Bookmark>;
  notifications: Map<string, Notification>;
  auditLogs: Map<string, AuditLog>;
}

let state: DatabaseState = createEmptyState();

function createEmptyState(): DatabaseState {
  return {
    users: new Map(),
    roles: new Map(),
    permissions: new Map(),
    userRoles: [],
    rolePermissions: [],
    articles: new Map(),
    categories: new Map(),
    tags: new Map(),
    articleTags: [],
    comments: new Map(),
    bookmarks: new Map(),
    notifications: new Map(),
    auditLogs: new Map(),
  };
}

// ============================================
// DATABASE OPERATIONS
// ============================================

export const db = {
  // ---- LIFECYCLE ----
  
  reset(): void {
    state = createEmptyState();
  },

  getState(): DatabaseState {
    return state;
  },

  getStats(): Record<string, number> {
    return {
      users: state.users.size,
      roles: state.roles.size,
      permissions: state.permissions.size,
      userRoles: state.userRoles.length,
      articles: state.articles.size,
      categories: state.categories.size,
      tags: state.tags.size,
      articleTags: state.articleTags.length,
      comments: state.comments.size,
      bookmarks: state.bookmarks.size,
      notifications: state.notifications.size,
      auditLogs: state.auditLogs.size,
    };
  },

  // ---- USERS ----

  createUser(input: CreateUserInput): User {
    // Check unique email
    for (const u of state.users.values()) {
      if (u.email === input.email) {
        throw new DatabaseError('UNIQUE_CONSTRAINT', `A user with email "${input.email}" already exists.`);
      }
    }

    const now = new Date().toISOString();
    const user: User = {
      id: generateId(),
      email: input.email,
      passwordHash: input.passwordHash,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl ?? null,
      bio: input.bio ?? null,
      isActive: input.isActive ?? true,
      emailVerified: input.emailVerified ?? false,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };

    state.users.set(user.id, user);
    return user;
  },

  getUserById(id: string): User | null {
    return state.users.get(id) ?? null;
  },

  getUserByEmail(email: string): User | null {
    for (const user of state.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  },

  listUsers(pagination?: PaginationParams, sort?: SortParams): { data: User[]; total: number } {
    let users = Array.from(state.users.values());
    users = applySort(users, sort);
    return applyPagination(users, pagination);
  },

  updateUser(id: string, updates: Partial<User>): User {
    const user = state.users.get(id);
    if (!user) throw new DatabaseError('NOT_FOUND', `User with id "${id}" not found.`);

    // Check email uniqueness if changing
    if (updates.email && updates.email !== user.email) {
      for (const u of state.users.values()) {
        if (u.email === updates.email && u.id !== id) {
          throw new DatabaseError('UNIQUE_CONSTRAINT', `Email "${updates.email}" is already in use.`);
        }
      }
    }

    const updated: User = { ...user, ...updates, updatedAt: new Date().toISOString() };
    state.users.set(id, updated);
    return updated;
  },

  deleteUser(id: string): void {
    if (!state.users.has(id)) {
      throw new DatabaseError('NOT_FOUND', `User with id "${id}" not found.`);
    }
    state.users.delete(id);
    // Cascade: remove user roles
    state.userRoles = state.userRoles.filter(ur => ur.userId !== id);
    // Cascade: remove bookmarks
    for (const [bid, b] of state.bookmarks) {
      if (b.userId === id) state.bookmarks.delete(bid);
    }
    // Cascade: remove notifications
    for (const [nid, n] of state.notifications) {
      if (n.userId === id) state.notifications.delete(nid);
    }
  },

  // ---- ROLES ----

  createRole(name: string, description?: string): RoleRecord {
    const now = new Date().toISOString();
    const role: RoleRecord = {
      id: generateId(),
      name: name as RoleRecord['name'],
      description: description ?? null,
      createdAt: now,
      updatedAt: now,
    };
    state.roles.set(role.id, role);
    return role;
  },

  getRoleByName(name: string): RoleRecord | null {
    for (const role of state.roles.values()) {
      if (role.name === name) return role;
    }
    return null;
  },

  listRoles(): RoleRecord[] {
    return Array.from(state.roles.values());
  },

  // ---- PERMISSIONS ----

  createPermission(name: string, module: string, description?: string): Permission {
    const now = new Date().toISOString();
    const perm: Permission = {
      id: generateId(),
      name,
      description: description ?? null,
      module,
      createdAt: now,
      updatedAt: now,
    };
    state.permissions.set(perm.id, perm);
    return perm;
  },

  listPermissions(): Permission[] {
    return Array.from(state.permissions.values());
  },

  // ---- USER ROLES ----

  assignRole(userId: string, roleId: string, assignedBy?: string): UserRole {
    if (!state.users.has(userId)) throw new DatabaseError('NOT_FOUND', 'User not found.');
    if (!state.roles.has(roleId)) throw new DatabaseError('NOT_FOUND', 'Role not found.');

    // Check if already assigned
    const existing = state.userRoles.find(ur => ur.userId === userId && ur.roleId === roleId);
    if (existing) return existing;

    const userRole: UserRole = {
      userId,
      roleId,
      assignedAt: new Date().toISOString(),
      assignedBy: assignedBy ?? null,
    };
    state.userRoles.push(userRole);
    return userRole;
  },

  removeRole(userId: string, roleId: string): void {
    state.userRoles = state.userRoles.filter(ur => !(ur.userId === userId && ur.roleId === roleId));
  },

  getUserRoles(userId: string): RoleRecord[] {
    const roleIds = state.userRoles.filter(ur => ur.userId === userId).map(ur => ur.roleId);
    return roleIds.map(id => state.roles.get(id)).filter(Boolean) as RoleRecord[];
  },

  // ---- ROLE PERMISSIONS ----

  assignPermission(roleId: string, permissionId: string): void {
    const exists = state.rolePermissions.some(rp => rp.roleId === roleId && rp.permissionId === permissionId);
    if (exists) return;
    state.rolePermissions.push({ roleId, permissionId });
  },

  getRolePermissions(roleId: string): Permission[] {
    const permIds = state.rolePermissions.filter(rp => rp.roleId === roleId).map(rp => rp.permissionId);
    return permIds.map(id => state.permissions.get(id)).filter(Boolean) as Permission[];
  },

  // ---- ARTICLES ----

  createArticle(input: CreateArticleInput): Article {
    // Validate unique slug
    for (const a of state.articles.values()) {
      if (a.slug === input.slug) {
        throw new DatabaseError('UNIQUE_CONSTRAINT', `An article with slug "${input.slug}" already exists.`);
      }
    }

    // Validate author exists
    if (!state.users.has(input.authorId)) {
      throw new DatabaseError('REFERENCE_NOT_FOUND', `Author with id "${input.authorId}" not found.`);
    }

    // Validate category if provided
    if (input.categoryId && !state.categories.has(input.categoryId)) {
      throw new DatabaseError('REFERENCE_NOT_FOUND', `Category with id "${input.categoryId}" not found.`);
    }

    const now = new Date().toISOString();
    const article: Article = {
      id: generateId(),
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      contentType: input.contentType ?? 'article' as Article['contentType'],
      status: input.status ?? 'draft' as Article['status'],
      featuredImage: input.featuredImage ?? null,
      authorId: input.authorId,
      categoryId: input.categoryId ?? null,
      readingTimeMinutes: input.readingTimeMinutes ?? calculateReadingTime(input.content),
      viewCount: 0,
      publishedAt: input.publishedAt ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      isFeatured: input.isFeatured ?? false,
      createdAt: now,
      updatedAt: now,
      createdById: input.createdById,
      updatedById: input.updatedById,
    };

    state.articles.set(article.id, article);
    return article;
  },

  getArticleById(id: string): Article | null {
    return state.articles.get(id) ?? null;
  },

  getArticleBySlug(slug: string): Article | null {
    for (const article of state.articles.values()) {
      if (article.slug === slug) return article;
    }
    return null;
  },

  listArticles(
    pagination?: PaginationParams,
    sort?: SortParams,
    filters?: ArticleFilters
  ): { data: Article[]; total: number } {
    let articles = Array.from(state.articles.values());

    // Apply filters
    if (filters) {
      if (filters.status) {
        articles = articles.filter(a => a.status === filters.status);
      }
      if (filters.contentType) {
        articles = articles.filter(a => a.contentType === filters.contentType);
      }
      if (filters.authorId) {
        articles = articles.filter(a => a.authorId === filters.authorId);
      }
      if (filters.categoryId) {
        articles = articles.filter(a => a.categoryId === filters.categoryId);
      }
      if (filters.tagId) {
        const articleIds = state.articleTags
          .filter(at => at.tagId === filters.tagId)
          .map(at => at.articleId);
        articles = articles.filter(a => articleIds.includes(a.id));
      }
      if (filters.isFeatured !== undefined) {
        articles = articles.filter(a => a.isFeatured === filters.isFeatured);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        articles = articles.filter(a =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
        );
      }
    }

    articles = applySort(articles, sort);
    return applyPagination(articles, pagination);
  },

  updateArticle(id: string, input: UpdateArticleInput): Article {
    const article = state.articles.get(id);
    if (!article) throw new DatabaseError('NOT_FOUND', `Article with id "${id}" not found.`);

    const updated: Article = {
      ...article,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    state.articles.set(id, updated);
    return updated;
  },

  deleteArticle(id: string): void {
    if (!state.articles.has(id)) {
      throw new DatabaseError('NOT_FOUND', `Article with id "${id}" not found.`);
    }
    state.articles.delete(id);
    // Cascade: remove article tags
    state.articleTags = state.articleTags.filter(at => at.articleId !== id);
    // Cascade: remove comments
    for (const [cid, c] of state.comments) {
      if (c.articleId === id) state.comments.delete(cid);
    }
    // Cascade: remove bookmarks
    for (const [bid, b] of state.bookmarks) {
      if (b.articleId === id) state.bookmarks.delete(bid);
    }
  },

  incrementViewCount(id: string): void {
    const article = state.articles.get(id);
    if (!article) return;
    article.viewCount += 1;
    state.articles.set(id, article);
  },

  // ---- ARTICLE TAGS ----

  addTagToArticle(articleId: string, tagId: string): void {
    if (!state.articles.has(articleId)) throw new DatabaseError('NOT_FOUND', 'Article not found.');
    if (!state.tags.has(tagId)) throw new DatabaseError('NOT_FOUND', 'Tag not found.');

    const exists = state.articleTags.some(at => at.articleId === articleId && at.tagId === tagId);
    if (exists) return;

    state.articleTags.push({ articleId, tagId });
  },

  removeTagFromArticle(articleId: string, tagId: string): void {
    state.articleTags = state.articleTags.filter(at => !(at.articleId === articleId && at.tagId === tagId));
  },

  getArticleTags(articleId: string): Tag[] {
    const tagIds = state.articleTags.filter(at => at.articleId === articleId).map(at => at.tagId);
    return tagIds.map(id => state.tags.get(id)).filter(Boolean) as Tag[];
  },

  // ---- CATEGORIES ----

  createCategory(input: CreateCategoryInput): Category {
    // Check unique slug
    for (const c of state.categories.values()) {
      if (c.slug === input.slug) {
        throw new DatabaseError('UNIQUE_CONSTRAINT', `Category with slug "${input.slug}" already exists.`);
      }
    }

    if (input.parentId && !state.categories.has(input.parentId)) {
      throw new DatabaseError('REFERENCE_NOT_FOUND', 'Parent category not found.');
    }

    const now = new Date().toISOString();
    const category: Category = {
      id: generateId(),
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      parentId: input.parentId ?? null,
      createdAt: now,
      updatedAt: now,
    };

    state.categories.set(category.id, category);
    return category;
  },

  getCategoryById(id: string): Category | null {
    return state.categories.get(id) ?? null;
  },

  getCategoryBySlug(slug: string): Category | null {
    for (const cat of state.categories.values()) {
      if (cat.slug === slug) return cat;
    }
    return null;
  },

  listCategories(): Category[] {
    return Array.from(state.categories.values());
  },

  getCategoryArticleCount(categoryId: string): number {
    let count = 0;
    for (const article of state.articles.values()) {
      if (article.categoryId === categoryId) count++;
    }
    return count;
  },

  // ---- TAGS ----

  createTag(input: CreateTagInput): Tag {
    for (const t of state.tags.values()) {
      if (t.slug === input.slug) {
        throw new DatabaseError('UNIQUE_CONSTRAINT', `Tag with slug "${input.slug}" already exists.`);
      }
    }

    const now = new Date().toISOString();
    const tag: Tag = {
      id: generateId(),
      name: input.name,
      slug: input.slug,
      createdAt: now,
      updatedAt: now,
    };

    state.tags.set(tag.id, tag);
    return tag;
  },

  getTagById(id: string): Tag | null {
    return state.tags.get(id) ?? null;
  },

  getTagBySlug(slug: string): Tag | null {
    for (const tag of state.tags.values()) {
      if (tag.slug === slug) return tag;
    }
    return null;
  },

  listTags(): Tag[] {
    return Array.from(state.tags.values());
  },

  getTagArticleCount(tagId: string): number {
    return state.articleTags.filter(at => at.tagId === tagId).length;
  },

  // ---- COMMENTS ----

  createComment(input: CreateCommentInput): Comment {
    if (!state.articles.has(input.articleId)) {
      throw new DatabaseError('REFERENCE_NOT_FOUND', 'Article not found.');
    }
    if (!state.users.has(input.authorId)) {
      throw new DatabaseError('REFERENCE_NOT_FOUND', 'Author not found.');
    }
    if (input.parentId && !state.comments.has(input.parentId)) {
      throw new DatabaseError('REFERENCE_NOT_FOUND', 'Parent comment not found.');
    }

    const now = new Date().toISOString();
    const comment: Comment = {
      id: generateId(),
      content: input.content,
      status: input.status ?? 'pending' as Comment['status'],
      articleId: input.articleId,
      authorId: input.authorId,
      parentId: input.parentId ?? null,
      createdAt: now,
      updatedAt: now,
    };

    state.comments.set(comment.id, comment);
    return comment;
  },

  getCommentById(id: string): Comment | null {
    return state.comments.get(id) ?? null;
  },

  listComments(
    pagination?: PaginationParams,
    sort?: SortParams,
    filters?: CommentFilters
  ): { data: Comment[]; total: number } {
    let comments = Array.from(state.comments.values());

    if (filters) {
      if (filters.articleId) comments = comments.filter(c => c.articleId === filters.articleId);
      if (filters.authorId) comments = comments.filter(c => c.authorId === filters.authorId);
      if (filters.status) comments = comments.filter(c => c.status === filters.status);
      if (filters.parentId !== undefined) {
        comments = comments.filter(c => c.parentId === filters.parentId);
      }
    }

    comments = applySort(comments, sort);
    return applyPagination(comments, pagination);
  },

  updateComment(id: string, updates: Partial<Comment>): Comment {
    const comment = state.comments.get(id);
    if (!comment) throw new DatabaseError('NOT_FOUND', `Comment with id "${id}" not found.`);
    const updated = { ...comment, ...updates, updatedAt: new Date().toISOString() };
    state.comments.set(id, updated);
    return updated;
  },

  deleteComment(id: string): void {
    if (!state.comments.has(id)) throw new DatabaseError('NOT_FOUND', `Comment "${id}" not found.`);
    state.comments.delete(id);
    // Cascade: delete replies
    for (const [cid, c] of state.comments) {
      if (c.parentId === id) state.comments.delete(cid);
    }
  },

  // ---- BOOKMARKS ----

  addBookmark(userId: string, articleId: string): Bookmark {
    if (!state.users.has(userId)) throw new DatabaseError('NOT_FOUND', 'User not found.');
    if (!state.articles.has(articleId)) throw new DatabaseError('NOT_FOUND', 'Article not found.');

    // Check unique
    for (const b of state.bookmarks.values()) {
      if (b.userId === userId && b.articleId === articleId) return b;
    }

    const bookmark: Bookmark = {
      id: generateId(),
      userId,
      articleId,
      createdAt: new Date().toISOString(),
    };
    state.bookmarks.set(bookmark.id, bookmark);
    return bookmark;
  },

  removeBookmark(userId: string, articleId: string): void {
    for (const [id, b] of state.bookmarks) {
      if (b.userId === userId && b.articleId === articleId) {
        state.bookmarks.delete(id);
        return;
      }
    }
  },

  getUserBookmarks(userId: string): Bookmark[] {
    return Array.from(state.bookmarks.values()).filter(b => b.userId === userId);
  },

  isBookmarked(userId: string, articleId: string): boolean {
    for (const b of state.bookmarks.values()) {
      if (b.userId === userId && b.articleId === articleId) return true;
    }
    return false;
  },

  // ---- NOTIFICATIONS ----

  createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    link?: string
  ): Notification {
    const notification: Notification = {
      id: generateId(),
      type,
      title,
      message,
      isRead: false,
      userId,
      link: link ?? null,
      createdAt: new Date().toISOString(),
    };
    state.notifications.set(notification.id, notification);
    return notification;
  },

  getUserNotifications(userId: string, unreadOnly = false): Notification[] {
    let notifs = Array.from(state.notifications.values()).filter(n => n.userId === userId);
    if (unreadOnly) notifs = notifs.filter(n => !n.isRead);
    return notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  markNotificationRead(id: string): void {
    const notif = state.notifications.get(id);
    if (!notif) return;
    notif.isRead = true;
    state.notifications.set(id, notif);
  },

  markAllNotificationsRead(userId: string): void {
    for (const [id, n] of state.notifications) {
      if (n.userId === userId) {
        n.isRead = true;
        state.notifications.set(id, n);
      }
    }
  },

  getUnreadNotificationCount(userId: string): number {
    return Array.from(state.notifications.values()).filter(n => n.userId === userId && !n.isRead).length;
  },

  // ---- AUDIT LOGS ----

  createAuditLog(
    action: AuditLog['action'],
    entityType: string,
    entityId: string | null,
    userId: string | null,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): AuditLog {
    const log: AuditLog = {
      id: generateId(),
      action,
      entityType,
      entityId,
      userId,
      details: details ?? null,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      createdAt: new Date().toISOString(),
    };
    state.auditLogs.set(log.id, log);
    return log;
  },

  listAuditLogs(
    pagination?: PaginationParams,
    filters?: { userId?: string; action?: AuditAction; entityType?: string }
  ): { data: AuditLog[]; total: number } {
    let logs = Array.from(state.auditLogs.values());

    if (filters) {
      if (filters.userId) logs = logs.filter(l => l.userId === filters.userId);
      if (filters.action) logs = logs.filter(l => l.action === filters.action);
      if (filters.entityType) logs = logs.filter(l => l.entityType === filters.entityType);
    }

    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return applyPagination(logs, pagination);
  },
};

// ============================================
// HELPERS
// ============================================

function applySort<T>(items: T[], sort?: SortParams): T[] {
  if (!sort?.sortBy) return items;

  const key = sort.sortBy as keyof T;
  const order = sort.sortOrder === 'asc' ? 1 : -1;

  return [...items].sort((a, b) => {
    const aVal = a[key] as unknown;
    const bVal = b[key] as unknown;
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * order;
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * order;
    }
    return 0;
  });
}

function applyPagination<T>(items: T[], pagination?: PaginationParams): { data: T[]; total: number } {
  const page = Math.max(1, pagination?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, pagination?.pageSize ?? 12));
  const total = items.length;
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);

  return { data, total };
}

function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ============================================
// DATABASE ERROR CLASS
// ============================================

export type DatabaseErrorCode =
  | 'NOT_FOUND'
  | 'UNIQUE_CONSTRAINT'
  | 'REFERENCE_NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR';

export class DatabaseError extends Error {
  code: DatabaseErrorCode;

  constructor(code: DatabaseErrorCode, message: string) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
  }
}
