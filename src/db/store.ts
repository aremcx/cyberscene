/**
 * In-Memory Database Store
 * Implements a full in-memory database with CRUD operations,
 * filtering, sorting, and pagination. Mirrors what Prisma would provide.
 */

import type {
  User, RoleRecord, Permission, UserRole, RolePermission,
  Article, ArticleRevision, Category, Tag, ArticleTag, Comment, Bookmark,
  Notification, AuditLog,
  CreateArticleInput, UpdateArticleInput, CreateUserInput,
  CreateCommentInput, CreateCategoryInput, CreateTagInput,
  PaginationParams, SortParams, ArticleFilters, CommentFilters,
  AuditAction,
} from './schema';

import type {
  ThreatActor,
  Malware,
  ThreatReport,
  Indicator,
  CreateThreatActorInput,
  CreateMalwareInput,
  CreateThreatReportInput,
  CreateIndicatorInput,
  ThreatActorFilters,
  MalwareFilters,
  ThreatReportFilters,
  IndicatorFilters,
} from './threatIntelSchema';

import type {
  Vulnerability,
  CreateVulnerabilityInput,
  UpdateVulnerabilityInput,
  VulnerabilityFilters,
} from './vulnerabilitySchema';
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
  revisions: Map<string, ArticleRevision>;
  threatActors: Map<string, ThreatActor>;
  malware: Map<string, Malware>;
  threatReports: Map<string, ThreatReport>;
  indicators: Map<string, Indicator>;
  vulnerabilities: Map<string, Vulnerability>;
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
    revisions: new Map(),
    threatActors: new Map(),
    malware: new Map(),
    threatReports: new Map(),
    indicators: new Map(),
    vulnerabilities: new Map(),
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
      revisions: state.revisions.size,
      threatActors: state.threatActors.size,
      malware: state.malware.size,
      threatReports: state.threatReports.size,
      indicators: state.indicators.size,
      vulnerabilities: state.vulnerabilities.size,
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
      difficulty: input.difficulty ?? null,
      featuredImage: input.featuredImage ?? null,
      authorId: input.authorId,
      categoryId: input.categoryId ?? null,
      readingTimeMinutes: input.readingTimeMinutes ?? calculateReadingTime(input.content),
      viewCount: 0,
      publishedAt: input.publishedAt ?? null,
      scheduledAt: input.scheduledAt ?? null,
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

    // Auto-create revision on content changes
    const hasContentChange = input.title || input.excerpt || input.content || input.status;
    if (hasContentChange) {
      const existingRevisions = this.getArticleRevisions(id);
      const nextRevisionNumber = existingRevisions.length > 0
        ? existingRevisions[0].revisionNumber + 1
        : 1;

      this.createRevision(
        id,
        nextRevisionNumber,
        updated.title,
        updated.excerpt,
        updated.content,
        updated.status,
        input.updatedById,
        null
      );
    }

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

  // ---- REVISIONS ----

  createRevision(
    articleId: string,
    revisionNumber: number,
    title: string,
    excerpt: string,
    content: string,
    status: Article['status'],
    changedById: string,
    changeNote?: string | null
  ): ArticleRevision {
    if (!state.articles.has(articleId)) {
      throw new DatabaseError('NOT_FOUND', `Article with id "${articleId}" not found.`);
    }

    const revision: ArticleRevision = {
      id: generateId(),
      articleId,
      revisionNumber,
      title,
      excerpt,
      content,
      status,
      changedById,
      changeNote: changeNote ?? null,
      createdAt: new Date().toISOString(),
    };

    state.revisions.set(revision.id, revision);
    return revision;
  },

  getArticleRevisions(articleId: string): ArticleRevision[] {
    return Array.from(state.revisions.values())
      .filter(r => r.articleId === articleId)
      .sort((a, b) => b.revisionNumber - a.revisionNumber);
  },

  getRevisionById(id: string): ArticleRevision | null {
    return state.revisions.get(id) ?? null;
  },

  getLatestRevision(articleId: string): ArticleRevision | null {
    const revisions = this.getArticleRevisions(articleId);
    return revisions.length > 0 ? revisions[0] : null;
  },

  // ============================================
  // THREAT ACTORS
  // ============================================

  createThreatActor(input: CreateThreatActorInput): ThreatActor {
    const now = new Date().toISOString();
    const actor: ThreatActor = {
      id: generateId(),
      name: input.name,
      aliases: input.aliases ?? [],
      description: input.description,
      classification: input.classification,
      knownTargets: input.knownTargets ?? [],
      geography: input.geography ?? [],
      techniques: input.techniques ?? [],
      references: input.references ?? [],
      isActive: input.isActive ?? true,
      firstSeen: input.firstSeen ?? null,
      lastSeen: input.lastSeen ?? null,
      createdAt: now,
      updatedAt: now,
    };
    state.threatActors.set(actor.id, actor);
    return actor;
  },

  getThreatActorById(id: string): ThreatActor | null {
    return state.threatActors.get(id) ?? null;
  },

  listThreatActors(
    pagination?: PaginationParams,
    sort?: SortParams,
    filters?: ThreatActorFilters
  ): { data: ThreatActor[]; total: number } {
    let actors = Array.from(state.threatActors.values());

    if (filters) {
      if (filters.classification) {
        actors = actors.filter(a => a.classification === filters.classification);
      }
      if (filters.isActive !== undefined) {
        actors = actors.filter(a => a.isActive === filters.isActive);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        actors = actors.filter(a =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.aliases.some(alias => alias.toLowerCase().includes(q))
        );
      }
    }

    actors = applySort(actors, sort);
    return applyPagination(actors, pagination);
  },

  updateThreatActor(id: string, updates: Partial<ThreatActor>): ThreatActor {
    const actor = state.threatActors.get(id);
    if (!actor) throw new DatabaseError('NOT_FOUND', `Threat actor with id "${id}" not found.`);
    const updated = { ...actor, ...updates, updatedAt: new Date().toISOString() };
    state.threatActors.set(id, updated);
    return updated;
  },

  deleteThreatActor(id: string): void {
    if (!state.threatActors.has(id)) {
      throw new DatabaseError('NOT_FOUND', `Threat actor with id "${id}" not found.`);
    }
    state.threatActors.delete(id);
  },

  // ============================================
  // MALWARE
  // ============================================

  createMalware(input: CreateMalwareInput): Malware {
    const now = new Date().toISOString();
    const malware: Malware = {
      id: generateId(),
      name: input.name,
      type: input.type,
      description: input.description,
      targets: input.targets ?? [],
      associatedActors: input.associatedActors ?? [],
      detectionInfo: input.detectionInfo,
      mitigation: input.mitigation,
      references: input.references ?? [],
      firstSeen: input.firstSeen ?? null,
      lastSeen: input.lastSeen ?? null,
      createdAt: now,
      updatedAt: now,
    };
    state.malware.set(malware.id, malware);
    return malware;
  },

  getMalwareById(id: string): Malware | null {
    return state.malware.get(id) ?? null;
  },

  listMalware(
    pagination?: PaginationParams,
    sort?: SortParams,
    filters?: MalwareFilters
  ): { data: Malware[]; total: number } {
    let items = Array.from(state.malware.values());

    if (filters) {
      if (filters.type) {
        items = items.filter(m => m.type === filters.type);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(m =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
        );
      }
    }

    items = applySort(items, sort);
    return applyPagination(items, pagination);
  },

  updateMalware(id: string, updates: Partial<Malware>): Malware {
    const malware = state.malware.get(id);
    if (!malware) throw new DatabaseError('NOT_FOUND', `Malware with id "${id}" not found.`);
    const updated = { ...malware, ...updates, updatedAt: new Date().toISOString() };
    state.malware.set(id, updated);
    return updated;
  },

  deleteMalware(id: string): void {
    if (!state.malware.has(id)) {
      throw new DatabaseError('NOT_FOUND', `Malware with id "${id}" not found.`);
    }
    state.malware.delete(id);
  },

  // ============================================
  // THREAT REPORTS
  // ============================================

  createThreatReport(input: CreateThreatReportInput): ThreatReport {
    const now = new Date().toISOString();
    const report: ThreatReport = {
      id: generateId(),
      title: input.title,
      summary: input.summary,
      threatActorId: input.threatActorId ?? null,
      malwareIds: input.malwareIds ?? [],
      targetSector: input.targetSector ?? [],
      geography: input.geography ?? [],
      techniques: input.techniques ?? [],
      indicators: input.indicators ?? [],
      detectionGuidance: input.detectionGuidance,
      mitigation: input.mitigation,
      references: input.references ?? [],
      publicationDate: input.publicationDate,
      severity: input.severity,
      createdAt: now,
      updatedAt: now,
    };
    state.threatReports.set(report.id, report);
    return report;
  },

  getThreatReportById(id: string): ThreatReport | null {
    return state.threatReports.get(id) ?? null;
  },

  listThreatReports(
    pagination?: PaginationParams,
    sort?: SortParams,
    filters?: ThreatReportFilters
  ): { data: ThreatReport[]; total: number } {
    let reports = Array.from(state.threatReports.values());

    if (filters) {
      if (filters.severity) {
        reports = reports.filter(r => r.severity === filters.severity);
      }
      if (filters.threatActorId) {
        reports = reports.filter(r => r.threatActorId === filters.threatActorId);
      }
      if (filters.targetSector) {
        reports = reports.filter(r => r.targetSector.includes(filters.targetSector!));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        reports = reports.filter(r =>
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q)
        );
      }
      if (filters.dateFrom) {
        reports = reports.filter(r => new Date(r.publicationDate) >= new Date(filters.dateFrom!));
      }
      if (filters.dateTo) {
        reports = reports.filter(r => new Date(r.publicationDate) <= new Date(filters.dateTo!));
      }
    }

    reports = applySort(reports, sort);
    return applyPagination(reports, pagination);
  },

  updateThreatReport(id: string, updates: Partial<ThreatReport>): ThreatReport {
    const report = state.threatReports.get(id);
    if (!report) throw new DatabaseError('NOT_FOUND', `Threat report with id "${id}" not found.`);
    const updated = { ...report, ...updates, updatedAt: new Date().toISOString() };
    state.threatReports.set(id, updated);
    return updated;
  },

  deleteThreatReport(id: string): void {
    if (!state.threatReports.has(id)) {
      throw new DatabaseError('NOT_FOUND', `Threat report with id "${id}" not found.`);
    }
    state.threatReports.delete(id);
  },

  // ============================================
  // INDICATORS
  // ============================================

  createIndicator(input: CreateIndicatorInput): Indicator {
    const now = new Date().toISOString();
    const indicator: Indicator = {
      id: generateId(),
      type: input.type,
      value: input.value,
      description: input.description,
      severity: input.severity,
      firstSeen: input.firstSeen ?? null,
      lastSeen: input.lastSeen ?? null,
      context: input.context,
      references: input.references ?? [],
      createdAt: now,
      updatedAt: now,
    };
    state.indicators.set(indicator.id, indicator);
    return indicator;
  },

  getIndicatorById(id: string): Indicator | null {
    return state.indicators.get(id) ?? null;
  },

  listIndicators(
    pagination?: PaginationParams,
    sort?: SortParams,
    filters?: IndicatorFilters
  ): { data: Indicator[]; total: number } {
    let indicators = Array.from(state.indicators.values());

    if (filters) {
      if (filters.type) {
        indicators = indicators.filter(i => i.type === filters.type);
      }
      if (filters.severity) {
        indicators = indicators.filter(i => i.severity === filters.severity);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        indicators = indicators.filter(i =>
          i.value.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
        );
      }
    }

    indicators = applySort(indicators, sort);
    return applyPagination(indicators, pagination);
  },

  updateIndicator(id: string, updates: Partial<Indicator>): Indicator {
    const indicator = state.indicators.get(id);
    if (!indicator) throw new DatabaseError('NOT_FOUND', `Indicator with id "${id}" not found.`);
    const updated = { ...indicator, ...updates, updatedAt: new Date().toISOString() };
    state.indicators.set(id, updated);
    return updated;
  },

  deleteIndicator(id: string): void {
    if (!state.indicators.has(id)) {
      throw new DatabaseError('NOT_FOUND', `Indicator with id "${id}" not found.`);
    }
    state.indicators.delete(id);
  },

  // ============================================
  // VULNERABILITIES
  // ============================================

  createVulnerability(input: CreateVulnerabilityInput): Vulnerability {
    // Check for duplicate CVE ID
    for (const v of state.vulnerabilities.values()) {
      if (v.cveId === input.cveId) {
        throw new DatabaseError('UNIQUE_CONSTRAINT', `Vulnerability with CVE ID "${input.cveId}" already exists.`);
      }
    }

    const now = new Date().toISOString();
    const vuln: Vulnerability = {
      id: generateId(),
      cveId: input.cveId,
      title: input.title,
      description: input.description,
      severity: input.severity,
      cvssScore: input.cvssScore,
      cvssVector: input.cvssVector,
      vendor: input.vendor,
      product: input.product,
      affectedVersions: input.affectedVersions,
      publishedDate: input.publishedDate,
      updatedDate: input.updatedDate,
      remediation: input.remediation,
      references: input.references ?? [],
      status: input.status ?? 'analyzing' as Vulnerability['status'],
      isExploited: input.isExploited ?? false,
      relatedArticles: input.relatedArticles ?? [],
      createdAt: now,
      updatedAt: now,
    };
    state.vulnerabilities.set(vuln.id, vuln);
    return vuln;
  },

  getVulnerabilityById(id: string): Vulnerability | null {
    return state.vulnerabilities.get(id) ?? null;
  },

  getVulnerabilityByCveId(cveId: string): Vulnerability | null {
    for (const vuln of state.vulnerabilities.values()) {
      if (vuln.cveId === cveId) return vuln;
    }
    return null;
  },

  listVulnerabilities(
    pagination?: PaginationParams,
    sort?: SortParams,
    filters?: VulnerabilityFilters
  ): { data: Vulnerability[]; total: number } {
    let vulns = Array.from(state.vulnerabilities.values());

    if (filters) {
      if (filters.severity) {
        vulns = vulns.filter(v => v.severity === filters.severity);
      }
      if (filters.vendor) {
        vulns = vulns.filter(v => v.vendor.toLowerCase().includes(filters.vendor!.toLowerCase()));
      }
      if (filters.product) {
        vulns = vulns.filter(v => v.product.toLowerCase().includes(filters.product!.toLowerCase()));
      }
      if (filters.isExploited !== undefined) {
        vulns = vulns.filter(v => v.isExploited === filters.isExploited);
      }
      if (filters.status) {
        vulns = vulns.filter(v => v.status === filters.status);
      }
      if (filters.publishedAfter) {
        vulns = vulns.filter(v => new Date(v.publishedDate) >= new Date(filters.publishedAfter!));
      }
      if (filters.publishedBefore) {
        vulns = vulns.filter(v => new Date(v.publishedDate) <= new Date(filters.publishedBefore!));
      }
      if (filters.cvssMin !== undefined) {
        vulns = vulns.filter(v => v.cvssScore >= filters.cvssMin!);
      }
      if (filters.cvssMax !== undefined) {
        vulns = vulns.filter(v => v.cvssScore <= filters.cvssMax!);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        vulns = vulns.filter(v =>
          v.cveId.toLowerCase().includes(q) ||
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.vendor.toLowerCase().includes(q) ||
          v.product.toLowerCase().includes(q)
        );
      }
    }

    vulns = applySort(vulns, sort);
    return applyPagination(vulns, pagination);
  },

  updateVulnerability(id: string, input: UpdateVulnerabilityInput): Vulnerability {
    const vuln = state.vulnerabilities.get(id);
    if (!vuln) throw new DatabaseError('NOT_FOUND', `Vulnerability with id "${id}" not found.`);
    const updated = { ...vuln, ...input, updatedAt: new Date().toISOString() };
    state.vulnerabilities.set(id, updated);
    return updated;
  },

  deleteVulnerability(id: string): void {
    if (!state.vulnerabilities.has(id)) {
      throw new DatabaseError('NOT_FOUND', `Vulnerability with id "${id}" not found.`);
    }
    state.vulnerabilities.delete(id);
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
