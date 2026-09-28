/**
 * Database Service Layer
 * Provides Prisma-based database operations
 * This will replace the in-memory store for production
 */

// Note: This file will be fully functional after running:
// npm install @prisma/client prisma
// npx prisma generate

import type { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

/**
 * Get Prisma client instance
 */
export async function getPrismaClient(): Promise<PrismaClient> {
  if (!prismaInstance) {
    const { PrismaClient } = await import('@prisma/client');
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prismaInstance;
}

/**
 * Disconnect Prisma client
 */
export async function disconnectPrisma(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}

/**
 * Database service class
 * Wraps Prisma operations with error handling and logging
 */
export class DatabaseService {
  private prisma: PrismaClient | null = null;

  async initialize(): Promise<void> {
    this.prisma = await getPrismaClient();
  }

  async disconnect(): Promise<void> {
    await disconnectPrisma();
    this.prisma = null;
  }

  private getClient(): PrismaClient {
    if (!this.prisma) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.prisma;
  }

  // ============================================
  // USER OPERATIONS
  // ============================================

  async createUser(data: {
    email: string;
    passwordHash: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
  }) {
    const prisma = this.getClient();
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
      },
    });
  }

  async getUserByEmail(email: string) {
    const prisma = this.getClient();
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async getUserById(id: string) {
    const prisma = this.getClient();
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async listUsers(options?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }) {
    const prisma = this.getClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 12;
    const skip = (page - 1) * pageSize;

    const where = options?.search
      ? {
          OR: [
            { email: { contains: options.search, mode: 'insensitive' } },
            { displayName: { contains: options.search, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async updateUser(id: string, data: Partial<{
    email: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    isActive: boolean;
    emailVerified: boolean;
    lastLoginAt: Date;
  }>) {
    const prisma = this.getClient();
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string) {
    const prisma = this.getClient();
    return prisma.user.delete({
      where: { id },
    });
  }

  // ============================================
  // ARTICLE OPERATIONS
  // ============================================

  async createArticle(data: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    contentType?: string;
    status?: string;
    difficulty?: string;
    featuredImage?: string;
    authorId: string;
    categoryId?: string;
    readingTimeMinutes?: number;
    publishedAt?: Date;
    scheduledAt?: Date;
    seoTitle?: string;
    seoDescription?: string;
    isFeatured?: boolean;
    createdById: string;
    updatedById: string;
  }) {
    const prisma = this.getClient();
    return prisma.article.create({
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        contentType: data.contentType as any ?? 'article',
        status: data.status as any ?? 'draft',
        difficulty: data.difficulty as any,
        featuredImage: data.featuredImage,
        authorId: data.authorId,
        categoryId: data.categoryId,
        readingTimeMinutes: data.readingTimeMinutes ?? 1,
        publishedAt: data.publishedAt,
        scheduledAt: data.scheduledAt,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        isFeatured: data.isFeatured ?? false,
        createdById: data.createdById,
        updatedById: data.updatedById,
      },
      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async getArticleById(id: string) {
    const prisma = this.getClient();
    return prisma.article.findUnique({
      where: { id },
      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async getArticleBySlug(slug: string) {
    const prisma = this.getClient();
    return prisma.article.findUnique({
      where: { slug },
      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async listArticles(options?: {
    page?: number;
    pageSize?: number;
    status?: string;
    contentType?: string;
    authorId?: string;
    categoryId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const prisma = this.getClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 12;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (options?.status) where.status = options.status;
    if (options?.contentType) where.contentType = options.contentType;
    if (options?.authorId) where.authorId = options.authorId;
    if (options?.categoryId) where.categoryId = options.categoryId;
    if (options?.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { excerpt: { contains: options.search, mode: 'insensitive' } },
        { content: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = options?.sortBy
      ? { [options.sortBy]: options.sortOrder ?? 'desc' }
      : { publishedAt: 'desc' };

    const [data, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          author: true,
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async updateArticle(id: string, data: any) {
    const prisma = this.getClient();
    return prisma.article.update({
      where: { id },
      data,
      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async deleteArticle(id: string) {
    const prisma = this.getClient();
    return prisma.article.delete({
      where: { id },
    });
  }

  async incrementArticleViewCount(id: string) {
    const prisma = this.getClient();
    return prisma.article.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  // ============================================
  // CATEGORY OPERATIONS
  // ============================================

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
  }) {
    const prisma = this.getClient();
    return prisma.category.create({
      data,
    });
  }

  async listCategories() {
    const prisma = this.getClient();
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        children: true,
        parent: true,
      },
    });
  }

  // ============================================
  // TAG OPERATIONS
  // ============================================

  async createTag(data: { name: string; slug: string }) {
    const prisma = this.getClient();
    return prisma.tag.create({
      data,
    });
  }

  async listTags() {
    const prisma = this.getClient();
    return prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async addTagToArticle(articleId: string, tagId: string) {
    const prisma = this.getClient();
    return prisma.articleTag.create({
      data: {
        articleId,
        tagId,
      },
    });
  }

  async removeTagFromArticle(articleId: string, tagId: string) {
    const prisma = this.getClient();
    return prisma.articleTag.delete({
      where: {
        articleId_tagId: {
          articleId,
          tagId,
        },
      },
    });
  }

  // ============================================
  // COMMENT OPERATIONS
  // ============================================

  async createComment(data: {
    content: string;
    articleId: string;
    authorId: string;
    parentId?: string;
    status?: string;
  }) {
    const prisma = this.getClient();
    return prisma.comment.create({
      data: {
        content: data.content,
        articleId: data.articleId,
        authorId: data.authorId,
        parentId: data.parentId,
        status: (data.status as any) ?? 'approved',
      },
      include: {
        author: true,
      },
    });
  }

  async listCommentsByArticle(articleId: string) {
    const prisma = this.getClient();
    return prisma.comment.findMany({
      where: { articleId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: true,
        replies: {
          include: {
            author: true,
          },
        },
      },
    });
  }

  // ============================================
  // BOOKMARK OPERATIONS
  // ============================================

  async addBookmark(userId: string, articleId: string) {
    const prisma = this.getClient();
    return prisma.bookmark.create({
      data: {
        userId,
        articleId,
      },
    });
  }

  async removeBookmark(userId: string, articleId: string) {
    const prisma = this.getClient();
    return prisma.bookmark.delete({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });
  }

  async isBookmarked(userId: string, articleId: string) {
    const prisma = this.getClient();
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });
    return bookmark !== null;
  }

  async getUserBookmarks(userId: string) {
    const prisma = this.getClient();
    return prisma.bookmark.findMany({
      where: { userId },
      include: {
        article: true,
      },
    });
  }

  // ============================================
  // NOTIFICATION OPERATIONS
  // ============================================

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
  }) {
    const prisma = this.getClient();
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        link: data.link,
      },
    });
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    const prisma = this.getClient();
    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markNotificationRead(id: string) {
    const prisma = this.getClient();
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllNotificationsRead(userId: string) {
    const prisma = this.getClient();
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadNotificationCount(userId: string) {
    const prisma = this.getClient();
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  // ============================================
  // AUDIT LOG OPERATIONS
  // ============================================

  async createAuditLog(data: {
    action: string;
    entityType: string;
    entityId?: string;
    userId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const prisma = this.getClient();
    return prisma.auditLog.create({
      data: {
        action: data.action as any,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async listAuditLogs(options?: {
    page?: number;
    pageSize?: number;
    userId?: string;
    action?: string;
    entityType?: string;
  }) {
    const prisma = this.getClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 50;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (options?.userId) where.userId = options.userId;
    if (options?.action) where.action = options.action;
    if (options?.entityType) where.entityType = options.entityType;

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  // ============================================
  // ROLE & PERMISSION OPERATIONS
  // ============================================

  async assignRole(userId: string, roleId: string, assignedBy?: string) {
    const prisma = this.getClient();
    return prisma.userRole.create({
      data: {
        userId,
        roleId,
        assignedBy,
      },
    });
  }

  async removeRole(userId: string, roleId: string) {
    const prisma = this.getClient();
    return prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
  }

  async getUserRoles(userId: string) {
    const prisma = this.getClient();
    return prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
      },
    });
  }

  async getRoleByName(name: string) {
    const prisma = this.getClient();
    return prisma.roleModel.findUnique({
      where: { name: name as any },
    });
  }

  async getRolePermissions(roleId: string) {
    const prisma = this.getClient();
    return prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });
  }

  // ============================================
  // DATABASE HEALTH CHECK
  // ============================================

  async healthCheck() {
    const prisma = this.getClient();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============================================
  // STATISTICS
  // ============================================

  async getStatistics() {
    const prisma = this.getClient();
    const [
      users,
      articles,
      categories,
      tags,
      comments,
      jobs,
      events,
      tools,
      vulnerabilities,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.article.count(),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.comment.count(),
      prisma.job.count(),
      prisma.event.count(),
      prisma.tool.count(),
      prisma.vulnerability.count(),
    ]);

    return {
      users,
      articles,
      categories,
      tags,
      comments,
      jobs,
      events,
      tools,
      vulnerabilities,
    };
  }
}

// Export singleton instance
export const dbService = new DatabaseService();
