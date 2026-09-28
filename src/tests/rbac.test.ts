/**
 * RBAC Tests
 * Comprehensive tests for role-based access control
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/store';
import * as authService from '../services/authService';
import { Role, ArticleStatus } from '../db/schema';
import { buildAuthContext, hasPermission, PERMISSIONS } from '../lib/authorization';

describe('Role-Based Access Control', () => {
  beforeEach(() => {
    db.reset();
    // Seed all roles
    db.createRole(Role.SUPER_ADMIN, 'Super Admin');
    db.createRole(Role.ADMIN, 'Admin');
    db.createRole(Role.EDITOR, 'Editor');
    db.createRole(Role.AUTHOR, 'Author');
    db.createRole(Role.CONTRIBUTOR, 'Contributor');
    db.createRole(Role.MODERATOR, 'Moderator');
    db.createRole(Role.USER, 'User');
  });

  describe('Permission Assignment', () => {
    it('should assign role to user', async () => {
      const { user } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      const adminRole = db.getRoleByName(Role.ADMIN);
      
      db.assignRole(user.id, adminRole!.id);
      
      const userRoles = db.getUserRoles(user.id);
      expect(userRoles).toHaveLength(2); // USER + ADMIN
    });

    it('should build auth context with permissions', async () => {
      const { user } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      const adminRole = db.getRoleByName(Role.ADMIN);
      db.assignRole(user.id, adminRole!.id);
      
      const ctx = buildAuthContext(user.id);
      
      expect(ctx.userId).toBe(user.id);
      expect(ctx.roles).toContain(Role.USER);
      expect(ctx.roles).toContain(Role.ADMIN);
      expect(ctx.permissions.length).toBeGreaterThan(0);
    });

    it('should check permission correctly', async () => {
      const { user } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      const editorRole = db.getRoleByName(Role.EDITOR);
      db.assignRole(user.id, editorRole!.id);
      
      const ctx = buildAuthContext(user.id);
      
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_CREATE)).toBe(true);
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_PUBLISH)).toBe(true);
      expect(hasPermission(ctx, PERMISSIONS.SYSTEM_ADMIN)).toBe(false);
    });
  });

  describe('Role Hierarchy', () => {
    it('should enforce SUPER_ADMIN has all permissions', async () => {
      const { user } = await authService.register('admin@example.com', 'Test@1234', 'Admin');
      const superAdminRole = db.getRoleByName(Role.SUPER_ADMIN);
      db.assignRole(user.id, superAdminRole!.id);
      
      const ctx = buildAuthContext(user.id);
      
      expect(hasPermission(ctx, PERMISSIONS.SYSTEM_ADMIN)).toBe(true);
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_PUBLISH)).toBe(true);
      expect(hasPermission(ctx, PERMISSIONS.USERS_MANAGE)).toBe(true);
    });

    it('should enforce USER has limited permissions', async () => {
      const { user } = await authService.register('user@example.com', 'Test@1234', 'User');
      
      const ctx = buildAuthContext(user.id);
      
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_READ)).toBe(true);
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_CREATE)).toBe(false);
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_PUBLISH)).toBe(false);
    });

    it('should enforce EDITOR can publish but not manage users', async () => {
      const { user } = await authService.register('editor@example.com', 'Test@1234', 'Editor');
      const editorRole = db.getRoleByName(Role.EDITOR);
      db.assignRole(user.id, editorRole!.id);
      
      const ctx = buildAuthContext(user.id);
      
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_PUBLISH)).toBe(true);
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_EDIT_ANY)).toBe(true);
      expect(hasPermission(ctx, PERMISSIONS.USERS_MANAGE)).toBe(false);
    });

    it('should enforce AUTHOR can create but not publish', async () => {
      const { user } = await authService.register('author@example.com', 'Test@1234', 'Author');
      const authorRole = db.getRoleByName(Role.AUTHOR);
      db.assignRole(user.id, authorRole!.id);
      
      const ctx = buildAuthContext(user.id);
      
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_CREATE)).toBe(true);
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_EDIT_OWN)).toBe(true);
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_PUBLISH)).toBe(false);
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_EDIT_ANY)).toBe(false);
    });
  });

  describe('Resource Ownership', () => {
    it('should allow author to edit own article', async () => {
      const { user } = await authService.register('author@example.com', 'Test@1234', 'Author');
      const authorRole = db.getRoleByName(Role.AUTHOR);
      db.assignRole(user.id, authorRole!.id);
      
      const ctx = buildAuthContext(user.id);
      
      // Create article
      const article = db.createArticle({
        slug: 'test-article',
        title: 'Test Article',
        excerpt: 'Test excerpt',
        content: 'Test content',
        authorId: user.id,
        createdById: user.id,
        updatedById: user.id,
      });
      
      // Should be able to edit own article
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_EDIT_OWN)).toBe(true);
      expect(ctx.userId).toBe(article.authorId);
    });

    it('should prevent author from editing others articles', async () => {
      const author1 = await authService.register('author1@example.com', 'Test@1234', 'Author 1');
      const author2 = await authService.register('author2@example.com', 'Test@1234', 'Author 2');
      
      const authorRole = db.getRoleByName(Role.AUTHOR);
      db.assignRole(author1.user.id, authorRole!.id);
      db.assignRole(author2.user.id, authorRole!.id);
      
      const ctx = buildAuthContext(author1.user.id);
      
      // Create article as author2
      const article = db.createArticle({
        slug: 'test-article',
        title: 'Test Article',
        excerpt: 'Test excerpt',
        content: 'Test content',
        authorId: author2.user.id,
        createdById: author2.user.id,
        updatedById: author2.user.id,
      });
      
      // Author1 should not be able to edit author2's article
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_EDIT_OWN)).toBe(true);
      expect(ctx.userId).not.toBe(article.authorId);
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_EDIT_ANY)).toBe(false);
    });

    it('should allow editor to edit any article', async () => {
      const author = await authService.register('author@example.com', 'Test@1234', 'Author');
      const editor = await authService.register('editor@example.com', 'Test@1234', 'Editor');
      
      const editorRole = db.getRoleByName(Role.EDITOR);
      db.assignRole(editor.user.id, editorRole!.id);
      
      const ctx = buildAuthContext(editor.user.id);
      
      // Create article as author
      const article = db.createArticle({
        slug: 'test-article',
        title: 'Test Article',
        excerpt: 'Test excerpt',
        content: 'Test content',
        authorId: author.user.id,
        createdById: author.user.id,
        updatedById: author.user.id,
      });
      
      // Editor should be able to edit any article
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_EDIT_ANY)).toBe(true);
    });
  });

  describe('Privilege Escalation Prevention', () => {
    it('should prevent user from assigning roles to themselves', async () => {
      const { user } = await authService.register('user@example.com', 'Test@1234', 'User');
      
      const ctx = buildAuthContext(user.id);
      
      // User should not have permission to assign roles
      expect(hasPermission(ctx, PERMISSIONS.USERS_ASSIGN_ROLE)).toBe(false);
    });

    it('should prevent user from accessing admin endpoints', async () => {
      const { user } = await authService.register('user@example.com', 'Test@1234', 'User');
      
      const ctx = buildAuthContext(user.id);
      
      expect(hasPermission(ctx, PERMISSIONS.SYSTEM_ADMIN)).toBe(false);
      expect(hasPermission(ctx, PERMISSIONS.USERS_MANAGE)).toBe(false);
    });

    it('should prevent author from publishing without permission', async () => {
      const { user } = await authService.register('author@example.com', 'Test@1234', 'Author');
      const authorRole = db.getRoleByName(Role.AUTHOR);
      db.assignRole(user.id, authorRole!.id);
      
      const ctx = buildAuthContext(user.id);
      
      expect(hasPermission(ctx, PERMISSIONS.CONTENT_PUBLISH)).toBe(false);
    });
  });

  describe('Cross-User Resource Access', () => {
    it('should prevent user from accessing other users data', async () => {
      const user1 = await authService.register('user1@example.com', 'Test@1234', 'User 1');
      const user2 = await authService.register('user2@example.com', 'Test@1234', 'User 2');
      
      const ctx1 = buildAuthContext(user1.user.id);
      
      // User1 should not be able to manage user2
      expect(hasPermission(ctx1, PERMISSIONS.USERS_MANAGE)).toBe(false);
    });

    it('should allow admin to access all users data', async () => {
      const user = await authService.register('user@example.com', 'Test@1234', 'User');
      const admin = await authService.register('admin@example.com', 'Test@1234', 'Admin');
      
      const adminRole = db.getRoleByName(Role.ADMIN);
      db.assignRole(admin.user.id, adminRole!.id);
      
      const ctx = buildAuthContext(admin.user.id);
      
      expect(hasPermission(ctx, PERMISSIONS.USERS_MANAGE)).toBe(true);
      expect(hasPermission(ctx, PERMISSIONS.USERS_READ)).toBe(true);
    });
  });
});
