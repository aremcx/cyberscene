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

import type {
  Tool,
  CreateToolInput,
  UpdateToolInput,
  ToolFilters,
} from './toolsSchema';

import type {
  LearningPath,
  Course,
  Module,
  Lesson,
  Quiz,
  QuizQuestion,
  Lab,
  LabQuestion,
  Badge,
  UserEnrollment,
  LessonProgress,
  QuizAttempt,
  LabAttempt,
  UserBadge,
  UserPoints,
  CreateCourseInput,
  CreateModuleInput,
  CreateLessonInput,
  CreateQuizInput,
  CreateLabInput,
  CourseFilters,
  LabFilters,
} from './academySchema';

import {
  Difficulty,
  LessonType,
  QuizQuestionType,
  LabType,
} from './academySchema';

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
  tools: Map<string, Tool>;
  // Academy
  learningPaths: Map<string, LearningPath>;
  courses: Map<string, Course>;
  modules: Map<string, Module>;
  lessons: Map<string, Lesson>;
  quizzes: Map<string, Quiz>;
  quizQuestions: Map<string, QuizQuestion>;
  labs: Map<string, Lab>;
  labQuestions: Map<string, LabQuestion>;
  badges: Map<string, Badge>;
  userEnrollments: UserEnrollment[];
  lessonProgress: LessonProgress[];
  quizAttempts: QuizAttempt[];
  labAttempts: LabAttempt[];
  userBadges: UserBadge[];
  userPoints: Map<string, UserPoints>;
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
    tools: new Map(),
    // Academy
    learningPaths: new Map(),
    courses: new Map(),
    modules: new Map(),
    lessons: new Map(),
    quizzes: new Map(),
    quizQuestions: new Map(),
    labs: new Map(),
    labQuestions: new Map(),
    badges: new Map(),
    userEnrollments: [],
    lessonProgress: [],
    quizAttempts: [],
    labAttempts: [],
    userBadges: [],
    userPoints: new Map(),
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
      tools: state.tools.size,
      // Academy
      learningPaths: state.learningPaths.size,
      courses: state.courses.size,
      modules: state.modules.size,
      lessons: state.lessons.size,
      quizzes: state.quizzes.size,
      quizQuestions: state.quizQuestions.size,
      labs: state.labs.size,
      labQuestions: state.labQuestions.size,
      badges: state.badges.size,
      userEnrollments: state.userEnrollments.length,
      lessonProgress: state.lessonProgress.length,
      quizAttempts: state.quizAttempts.length,
      labAttempts: state.labAttempts.length,
      userBadges: state.userBadges.length,
      userPoints: state.userPoints.size,
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

  // ============================================
  // TOOLS
  // ============================================

  createTool(input: CreateToolInput): Tool {
    // Check for duplicate slug
    for (const t of state.tools.values()) {
      if (t.slug === input.slug) {
        throw new DatabaseError('UNIQUE_CONSTRAINT', `Tool with slug "${input.slug}" already exists.`);
      }
    }

    const now = new Date().toISOString();
    const tool: Tool = {
      id: generateId(),
      name: input.name,
      slug: input.slug,
      description: input.description,
      longDescription: input.longDescription,
      logoUrl: input.logoUrl ?? null,
      category: input.category,
      platforms: input.platforms,
      license: input.license,
      website: input.website,
      documentationUrl: input.documentationUrl ?? null,
      githubUrl: input.githubUrl ?? null,
      useCases: input.useCases ?? [],
      skillLevel: input.skillLevel,
      relatedTutorialIds: input.relatedTutorialIds ?? [],
      relatedArticleIds: input.relatedArticleIds ?? [],
      pricing: input.pricing ?? null,
      features: input.features ?? [],
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    state.tools.set(tool.id, tool);
    return tool;
  },

  getToolById(id: string): Tool | null {
    return state.tools.get(id) ?? null;
  },

  getToolBySlug(slug: string): Tool | null {
    for (const tool of state.tools.values()) {
      if (tool.slug === slug) return tool;
    }
    return null;
  },

  listTools(
    pagination?: PaginationParams,
    sort?: SortParams,
    filters?: ToolFilters
  ): { data: Tool[]; total: number } {
    let tools = Array.from(state.tools.values());

    if (filters) {
      if (filters.category) {
        tools = tools.filter(t => t.category === filters.category);
      }
      if (filters.platform) {
        tools = tools.filter(t => t.platforms.includes(filters.platform!));
      }
      if (filters.license) {
        tools = tools.filter(t => t.license === filters.license);
      }
      if (filters.skillLevel) {
        tools = tools.filter(t => t.skillLevel === filters.skillLevel);
      }
      if (filters.isActive !== undefined) {
        tools = tools.filter(t => t.isActive === filters.isActive);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        tools = tools.filter(t =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.longDescription.toLowerCase().includes(q) ||
          t.useCases.some(uc => uc.toLowerCase().includes(q))
        );
      }
    }

    tools = applySort(tools, sort);
    return applyPagination(tools, pagination);
  },

  updateTool(id: string, input: UpdateToolInput): Tool {
    const tool = state.tools.get(id);
    if (!tool) throw new DatabaseError('NOT_FOUND', `Tool with id "${id}" not found.`);
    
    // Check for duplicate slug if changing
    if (input.slug && input.slug !== tool.slug) {
      for (const t of state.tools.values()) {
        if (t.slug === input.slug && t.id !== id) {
          throw new DatabaseError('UNIQUE_CONSTRAINT', `Tool with slug "${input.slug}" already exists.`);
        }
      }
    }

    const updated = { ...tool, ...input, updatedAt: new Date().toISOString() };
    state.tools.set(id, updated);
    return updated;
  },

  deleteTool(id: string): void {
    if (!state.tools.has(id)) {
      throw new DatabaseError('NOT_FOUND', `Tool with id "${id}" not found.`);
    }
    state.tools.delete(id);
  },

  // ============================================
  // ACADEMY - LEARNING PATHS
  // ============================================

  createLearningPath(input: {
    name: string;
    slug: string;
    description: string;
    icon: string;
    difficulty: Difficulty;
    estimatedHours: number;
    courseIds?: string[];
    isActive?: boolean;
  }): LearningPath {
    const now = new Date().toISOString();
    const path: LearningPath = {
      id: generateId(),
      name: input.name,
      slug: input.slug,
      description: input.description,
      icon: input.icon,
      difficulty: input.difficulty,
      estimatedHours: input.estimatedHours,
      courseIds: input.courseIds ?? [],
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    state.learningPaths.set(path.id, path);
    return path;
  },

  getLearningPathById(id: string): LearningPath | null {
    return state.learningPaths.get(id) ?? null;
  },

  getLearningPathBySlug(slug: string): LearningPath | null {
    for (const path of state.learningPaths.values()) {
      if (path.slug === slug) return path;
    }
    return null;
  },

  listLearningPaths(): LearningPath[] {
    return Array.from(state.learningPaths.values());
  },

  updateLearningPath(id: string, updates: Partial<LearningPath>): LearningPath {
    const path = state.learningPaths.get(id);
    if (!path) throw new DatabaseError('NOT_FOUND', `Learning path with id "${id}" not found.`);
    const updated = { ...path, ...updates, updatedAt: new Date().toISOString() };
    state.learningPaths.set(id, updated);
    return updated;
  },

  deleteLearningPath(id: string): void {
    if (!state.learningPaths.has(id)) {
      throw new DatabaseError('NOT_FOUND', `Learning path with id "${id}" not found.`);
    }
    state.learningPaths.delete(id);
  },

  // ============================================
  // ACADEMY - COURSES
  // ============================================

  createCourse(input: CreateCourseInput): Course {
    const now = new Date().toISOString();
    const course: Course = {
      id: generateId(),
      title: input.title,
      slug: input.slug,
      description: input.description,
      learningObjectives: input.learningObjectives,
      difficulty: input.difficulty,
      estimatedHours: input.estimatedHours,
      moduleIds: input.moduleIds ?? [],
      instructorId: input.instructorId,
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    state.courses.set(course.id, course);
    return course;
  },

  getCourseById(id: string): Course | null {
    return state.courses.get(id) ?? null;
  },

  getCourseBySlug(slug: string): Course | null {
    for (const course of state.courses.values()) {
      if (course.slug === slug) return course;
    }
    return null;
  },

  listCourses(filters?: CourseFilters): Course[] {
    let courses = Array.from(state.courses.values());
    
    if (filters) {
      if (filters.difficulty) {
        courses = courses.filter(c => c.difficulty === filters.difficulty);
      }
      if (filters.isActive !== undefined) {
        courses = courses.filter(c => c.isActive === filters.isActive);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        courses = courses.filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
        );
      }
    }
    
    return courses;
  },

  updateCourse(id: string, updates: Partial<Course>): Course {
    const course = state.courses.get(id);
    if (!course) throw new DatabaseError('NOT_FOUND', `Course with id "${id}" not found.`);
    const updated = { ...course, ...updates, updatedAt: new Date().toISOString() };
    state.courses.set(id, updated);
    return updated;
  },

  deleteCourse(id: string): void {
    if (!state.courses.has(id)) {
      throw new DatabaseError('NOT_FOUND', `Course with id "${id}" not found.`);
    }
    state.courses.delete(id);
  },

  // ============================================
  // ACADEMY - MODULES
  // ============================================

  createModule(input: CreateModuleInput): Module {
    const now = new Date().toISOString();
    const module: Module = {
      id: generateId(),
      title: input.title,
      description: input.description,
      order: input.order,
      courseId: input.courseId,
      lessonIds: input.lessonIds ?? [],
      createdAt: now,
      updatedAt: now,
    };
    state.modules.set(module.id, module);
    return module;
  },

  getModuleById(id: string): Module | null {
    return state.modules.get(id) ?? null;
  },

  listModulesByCourse(courseId: string): Module[] {
    return Array.from(state.modules.values())
      .filter(m => m.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  },

  updateModule(id: string, updates: Partial<Module>): Module {
    const module = state.modules.get(id);
    if (!module) throw new DatabaseError('NOT_FOUND', `Module with id "${id}" not found.`);
    const updated = { ...module, ...updates, updatedAt: new Date().toISOString() };
    state.modules.set(id, updated);
    return updated;
  },

  deleteModule(id: string): void {
    if (!state.modules.has(id)) {
      throw new DatabaseError('NOT_FOUND', `Module with id "${id}" not found.`);
    }
    state.modules.delete(id);
  },

  // ============================================
  // ACADEMY - LESSONS
  // ============================================

  createLesson(input: CreateLessonInput): Lesson {
    const now = new Date().toISOString();
    const lesson: Lesson = {
      id: generateId(),
      title: input.title,
      slug: input.slug,
      description: input.description,
      content: input.content,
      type: input.type,
      duration: input.duration,
      order: input.order,
      moduleId: input.moduleId,
      videoUrl: input.videoUrl,
      quizId: input.quizId,
      createdAt: now,
      updatedAt: now,
    };
    state.lessons.set(lesson.id, lesson);
    return lesson;
  },

  getLessonById(id: string): Lesson | null {
    return state.lessons.get(id) ?? null;
  },

  getLessonBySlug(slug: string): Lesson | null {
    for (const lesson of state.lessons.values()) {
      if (lesson.slug === slug) return lesson;
    }
    return null;
  },

  listLessonsByModule(moduleId: string): Lesson[] {
    return Array.from(state.lessons.values())
      .filter(l => l.moduleId === moduleId)
      .sort((a, b) => a.order - b.order);
  },

  updateLesson(id: string, updates: Partial<Lesson>): Lesson {
    const lesson = state.lessons.get(id);
    if (!lesson) throw new DatabaseError('NOT_FOUND', `Lesson with id "${id}" not found.`);
    const updated = { ...lesson, ...updates, updatedAt: new Date().toISOString() };
    state.lessons.set(id, updated);
    return updated;
  },

  deleteLesson(id: string): void {
    if (!state.lessons.has(id)) {
      throw new DatabaseError('NOT_FOUND', `Lesson with id "${id}" not found.`);
    }
    state.lessons.delete(id);
  },

  // ============================================
  // ACADEMY - QUIZZES
  // ============================================

  createQuiz(input: CreateQuizInput): Quiz {
    const now = new Date().toISOString();
    const quiz: Quiz = {
      id: generateId(),
      title: input.title,
      description: input.description,
      passingScore: input.passingScore,
      timeLimit: input.timeLimit,
      questionIds: input.questionIds ?? [],
      lessonId: input.lessonId,
      createdAt: now,
      updatedAt: now,
    };
    state.quizzes.set(quiz.id, quiz);
    return quiz;
  },

  getQuizById(id: string): Quiz | null {
    return state.quizzes.get(id) ?? null;
  },

  getQuizByLessonId(lessonId: string): Quiz | null {
    for (const quiz of state.quizzes.values()) {
      if (quiz.lessonId === lessonId) return quiz;
    }
    return null;
  },

  updateQuiz(id: string, updates: Partial<Quiz>): Quiz {
    const quiz = state.quizzes.get(id);
    if (!quiz) throw new DatabaseError('NOT_FOUND', `Quiz with id "${id}" not found.`);
    const updated = { ...quiz, ...updates, updatedAt: new Date().toISOString() };
    state.quizzes.set(id, updated);
    return updated;
  },

  deleteQuiz(id: string): void {
    if (!state.quizzes.has(id)) {
      throw new DatabaseError('NOT_FOUND', `Quiz with id "${id}" not found.`);
    }
    state.quizzes.delete(id);
  },

  // ============================================
  // ACADEMY - QUIZ QUESTIONS
  // ============================================

  createQuizQuestion(input: {
    quizId: string;
    question: string;
    type: QuizQuestionType;
    options: string[];
    correctAnswer: string;
    explanation: string;
    points: number;
    order: number;
  }): QuizQuestion {
    const now = new Date().toISOString();
    const question: QuizQuestion = {
      id: generateId(),
      quizId: input.quizId,
      question: input.question,
      type: input.type,
      options: input.options,
      correctAnswer: input.correctAnswer,
      explanation: input.explanation,
      points: input.points,
      order: input.order,
      createdAt: now,
      updatedAt: now,
    };
    state.quizQuestions.set(question.id, question);
    return question;
  },

  getQuizQuestionById(id: string): QuizQuestion | null {
    return state.quizQuestions.get(id) ?? null;
  },

  listQuizQuestionsByQuiz(quizId: string): QuizQuestion[] {
    return Array.from(state.quizQuestions.values())
      .filter(q => q.quizId === quizId)
      .sort((a, b) => a.order - b.order);
  },

  updateQuizQuestion(id: string, updates: Partial<QuizQuestion>): QuizQuestion {
    const question = state.quizQuestions.get(id);
    if (!question) throw new DatabaseError('NOT_FOUND', `Quiz question with id "${id}" not found.`);
    const updated = { ...question, ...updates, updatedAt: new Date().toISOString() };
    state.quizQuestions.set(id, updated);
    return updated;
  },

  deleteQuizQuestion(id: string): void {
    if (!state.quizQuestions.has(id)) {
      throw new DatabaseError('NOT_FOUND', `Quiz question with id "${id}" not found.`);
    }
    state.quizQuestions.delete(id);
  },

  // ============================================
  // ACADEMY - LABS
  // ============================================

  createLab(input: CreateLabInput): Lab {
    const now = new Date().toISOString();
    const lab: Lab = {
      id: generateId(),
      title: input.title,
      slug: input.slug,
      description: input.description,
      objectives: input.objectives,
      instructions: input.instructions,
      type: input.type,
      difficulty: input.difficulty,
      estimatedTime: input.estimatedTime,
      points: input.points,
      badgeId: input.badgeId ?? null,
      questionIds: input.questionIds ?? [],
      courseId: input.courseId ?? null,
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    state.labs.set(lab.id, lab);
    return lab;
  },

  getLabById(id: string): Lab | null {
    return state.labs.get(id) ?? null;
  },

  getLabBySlug(slug: string): Lab | null {
    for (const lab of state.labs.values()) {
      if (lab.slug === slug) return lab;
    }
    return null;
  },

  listLabs(filters?: LabFilters): Lab[] {
    let labs = Array.from(state.labs.values());
    
    if (filters) {
      if (filters.type) {
        labs = labs.filter(l => l.type === filters.type);
      }
      if (filters.difficulty) {
        labs = labs.filter(l => l.difficulty === filters.difficulty);
      }
      if (filters.isActive !== undefined) {
        labs = labs.filter(l => l.isActive === filters.isActive);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        labs = labs.filter(l =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
        );
      }
    }
    
    return labs;
  },

  updateLab(id: string, updates: Partial<Lab>): Lab {
    const lab = state.labs.get(id);
    if (!lab) throw new DatabaseError('NOT_FOUND', `Lab with id "${id}" not found.`);
    const updated = { ...lab, ...updates, updatedAt: new Date().toISOString() };
    state.labs.set(id, updated);
    return updated;
  },

  deleteLab(id: string): void {
    if (!state.labs.has(id)) {
      throw new DatabaseError('NOT_FOUND', `Lab with id "${id}" not found.`);
    }
    state.labs.delete(id);
  },

  // ============================================
  // ACADEMY - LAB QUESTIONS
  // ============================================

  createLabQuestion(input: {
    labId: string;
    question: string;
    type: QuizQuestionType;
    options: string[];
    correctAnswer: string;
    hint: string;
    points: number;
    order: number;
  }): LabQuestion {
    const now = new Date().toISOString();
    const question: LabQuestion = {
      id: generateId(),
      labId: input.labId,
      question: input.question,
      type: input.type,
      options: input.options,
      correctAnswer: input.correctAnswer,
      hint: input.hint,
      points: input.points,
      order: input.order,
      createdAt: now,
      updatedAt: now,
    };
    state.labQuestions.set(question.id, question);
    return question;
  },

  getLabQuestionById(id: string): LabQuestion | null {
    return state.labQuestions.get(id) ?? null;
  },

  listLabQuestionsByLab(labId: string): LabQuestion[] {
    return Array.from(state.labQuestions.values())
      .filter(q => q.labId === labId)
      .sort((a, b) => a.order - b.order);
  },

  // ============================================
  // ACADEMY - BADGES
  // ============================================

  createBadge(input: {
    name: string;
    description: string;
    icon: string;
    category: string;
    pointsRequired: number;
  }): Badge {
    const now = new Date().toISOString();
    const badge: Badge = {
      id: generateId(),
      name: input.name,
      description: input.description,
      icon: input.icon,
      category: input.category,
      pointsRequired: input.pointsRequired,
      createdAt: now,
      updatedAt: now,
    };
    state.badges.set(badge.id, badge);
    return badge;
  },

  getBadgeById(id: string): Badge | null {
    return state.badges.get(id) ?? null;
  },

  listBadges(): Badge[] {
    return Array.from(state.badges.values());
  },

  listBadgesByCategory(category: string): Badge[] {
    return Array.from(state.badges.values()).filter(b => b.category === category);
  },

  // ============================================
  // ACADEMY - USER PROGRESS
  // ============================================

  enrollUser(userId: string, courseId: string): UserEnrollment {
    // Check if already enrolled
    const existing = state.userEnrollments.find(
      e => e.userId === userId && e.courseId === courseId
    );
    if (existing) return existing;

    const enrollment: UserEnrollment = {
      id: generateId(),
      userId,
      courseId,
      enrolledAt: new Date().toISOString(),
      completedAt: null,
      progress: 0,
      lastLessonId: null,
    };
    state.userEnrollments.push(enrollment);
    return enrollment;
  },

  getUserEnrollment(userId: string, courseId: string): UserEnrollment | null {
    return state.userEnrollments.find(
      e => e.userId === userId && e.courseId === courseId
    ) ?? null;
  },

  getUserEnrollments(userId: string): UserEnrollment[] {
    return state.userEnrollments.filter(e => e.userId === userId);
  },

  updateEnrollmentProgress(userId: string, courseId: string, progress: number, lastLessonId?: string): void {
    const enrollment = state.userEnrollments.find(
      e => e.userId === userId && e.courseId === courseId
    );
    if (!enrollment) return;

    enrollment.progress = progress;
    if (lastLessonId) enrollment.lastLessonId = lastLessonId;
    if (progress >= 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date().toISOString();
    }
  },

  markLessonComplete(userId: string, lessonId: string, timeSpent: number): LessonProgress {
    // Check if already completed
    const existing = state.lessonProgress.find(
      p => p.userId === userId && p.lessonId === lessonId
    );
    if (existing) return existing;

    const progress: LessonProgress = {
      id: generateId(),
      userId,
      lessonId,
      completedAt: new Date().toISOString(),
      timeSpent,
    };
    state.lessonProgress.push(progress);
    return progress;
  },

  isLessonComplete(userId: string, lessonId: string): boolean {
    return state.lessonProgress.some(
      p => p.userId === userId && p.lessonId === lessonId
    );
  },

  submitQuizAttempt(
    userId: string,
    quizId: string,
    answers: Record<string, string>,
    score: number,
    passed: boolean,
    timeSpent: number
  ): QuizAttempt {
    const attempt: QuizAttempt = {
      id: generateId(),
      userId,
      quizId,
      answers,
      score,
      passed,
      completedAt: new Date().toISOString(),
      timeSpent,
    };
    state.quizAttempts.push(attempt);
    return attempt;
  },

  getUserQuizAttempts(userId: string, quizId?: string): QuizAttempt[] {
    let attempts = state.quizAttempts.filter(a => a.userId === userId);
    if (quizId) {
      attempts = attempts.filter(a => a.quizId === quizId);
    }
    return attempts;
  },

  submitLabAttempt(
    userId: string,
    labId: string,
    answers: Record<string, string>,
    score: number,
    completed: boolean,
    timeSpent: number
  ): LabAttempt {
    const attempt: LabAttempt = {
      id: generateId(),
      userId,
      labId,
      answers,
      score,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
      timeSpent,
    };
    state.labAttempts.push(attempt);
    return attempt;
  },

  getUserLabAttempts(userId: string, labId?: string): LabAttempt[] {
    let attempts = state.labAttempts.filter(a => a.userId === userId);
    if (labId) {
      attempts = attempts.filter(a => a.labId === labId);
    }
    return attempts;
  },

  awardBadge(userId: string, badgeId: string): UserBadge {
    // Check if already awarded
    const existing = state.userBadges.find(
      b => b.userId === userId && b.badgeId === badgeId
    );
    if (existing) return existing;

    const userBadge: UserBadge = {
      id: generateId(),
      userId,
      badgeId,
      earnedAt: new Date().toISOString(),
    };
    state.userBadges.push(userBadge);
    return userBadge;
  },

  getUserBadges(userId: string): UserBadge[] {
    return state.userBadges.filter(b => b.userId === userId);
  },

  hasUserBadge(userId: string, badgeId: string): boolean {
    return state.userBadges.some(b => b.userId === userId && b.badgeId === badgeId);
  },

  updateUserPoints(userId: string, points: number): UserPoints {
    const existing = state.userPoints.get(userId);
    const now = new Date().toISOString();
    
    if (existing) {
      existing.totalPoints += points;
      existing.level = Math.floor(existing.totalPoints / 100) + 1;
      existing.updatedAt = now;
      return existing;
    }

    const userPoints: UserPoints = {
      id: generateId(),
      userId,
      totalPoints: points,
      level: Math.floor(points / 100) + 1,
      updatedAt: now,
    };
    state.userPoints.set(userId, userPoints);
    return userPoints;
  },

  getUserPoints(userId: string): UserPoints | null {
    return state.userPoints.get(userId) ?? null;
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
