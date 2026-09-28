/**
 * Authentication Tests
 * Comprehensive tests for authentication functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/store';
import * as authService from '../services/authService';
import { hashPassword } from '../lib/crypto';
import { Role } from '../db/schema';

describe('Authentication Service', () => {
  beforeEach(() => {
    db.reset();
    // Seed roles
    db.createRole(Role.USER, 'Regular user');
    db.createRole(Role.ADMIN, 'Administrator');
  });

  describe('Registration', () => {
    it('should register a new user with valid credentials', async () => {
      const result = await authService.register(
        'test@example.com',
        'Test@1234',
        'Test User'
      );

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.displayName).toBe('Test User');
      expect(result.session).toBeDefined();
      expect(result.session.id).toBeDefined();
    });

    it('should reject registration with weak password', async () => {
      await expect(
        authService.register('test@example.com', 'weak', 'Test User')
      ).rejects.toThrow('Password does not meet strength requirements');
    });

    it('should reject registration with invalid email', async () => {
      await expect(
        authService.register('invalid-email', 'Test@1234', 'Test User')
      ).rejects.toThrow();
    });

    it('should reject duplicate email registration', async () => {
      await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      await expect(
        authService.register('test@example.com', 'Test@1234', 'Another User')
      ).rejects.toThrow('An account with this email already exists');
    });

    it('should assign default USER role on registration', async () => {
      const result = await authService.register(
        'test@example.com',
        'Test@1234',
        'Test User'
      );

      const userRoles = db.getUserRoles(result.user.id);
      expect(userRoles).toHaveLength(1);
      expect(userRoles[0].name).toBe(Role.USER);
    });
  });

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      const result = await authService.login('test@example.com', 'Test@1234');
      
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.session).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      await expect(
        authService.login('test@example.com', 'WrongPassword123')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should reject login with non-existent email', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'Test@1234')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should reject login for inactive user', async () => {
      const { user } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      db.updateUser(user.id, { isActive: false });
      
      await expect(
        authService.login('test@example.com', 'Test@1234')
      ).rejects.toThrow('Account is deactivated');
    });

    it('should update last login timestamp', async () => {
      const { user } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      await authService.login('test@example.com', 'Test@1234');
      
      const updatedUser = db.getUserById(user.id);
      expect(updatedUser?.lastLoginAt).toBeDefined();
    });
  });

  describe('Logout', () => {
    it('should invalidate session on logout', async () => {
      const { session, user } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      authService.logout(session.id, user.id);
      
      const validatedSession = authService.validateSession(session.id);
      expect(validatedSession).toBeNull();
    });

    it('should prevent logout with wrong user ID', async () => {
      const { session, user } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      expect(() => {
        authService.logout(session.id, 'wrong-user-id');
      }).toThrow('Invalid session');
    });
  });

  describe('Session Management', () => {
    it('should validate active session', async () => {
      const { session } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      const user = authService.validateSession(session.id);
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should reject invalid session ID', () => {
      const user = authService.validateSession('invalid-session-id');
      expect(user).toBeNull();
    });

    it('should refresh session', async () => {
      const { session } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      const refreshed = authService.refreshSession(session.id);
      expect(refreshed).toBe(true);
    });
  });

  describe('Password Reset', () => {
    it('should generate password reset token', async () => {
      await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      const result = await authService.requestPasswordReset('test@example.com');
      
      expect(result.token).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });

    it('should not reveal if email exists', async () => {
      const result = await authService.requestPasswordReset('nonexistent@example.com');
      
      // Should return fake token to prevent email enumeration
      expect(result.token).toBe('fake_token');
    });

    it('should reset password with valid token', async () => {
      await authService.register('test@example.com', 'Test@1234', 'Test User');
      const { token } = await authService.requestPasswordReset('test@example.com');
      
      await authService.resetPassword(token, 'NewPassword@1234');
      
      // Should be able to login with new password
      const result = await authService.login('test@example.com', 'NewPassword@1234');
      expect(result.user).toBeDefined();
    });

    it('should reject invalid reset token', async () => {
      await expect(
        authService.resetPassword('invalid-token', 'NewPassword@1234')
      ).rejects.toThrow('Invalid or expired reset token');
    });
  });

  describe('Password Change', () => {
    it('should change password for authenticated user', async () => {
      const { user, session } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      await authService.changePassword(user.id, 'Test@1234', 'NewPassword@1234', session.id);
      
      // Should be able to login with new password
      const result = await authService.login('test@example.com', 'NewPassword@1234');
      expect(result.user).toBeDefined();
    });

    it('should reject password change with wrong current password', async () => {
      const { user, session } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      await expect(
        authService.changePassword(user.id, 'WrongPassword', 'NewPassword@1234', session.id)
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should invalidate other sessions on password change', async () => {
      const { user, session } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      // Create another session
      const login2 = await authService.login('test@example.com', 'Test@1234');
      
      // Change password
      await authService.changePassword(user.id, 'Test@1234', 'NewPassword@1234', session.id);
      
      // Other session should be invalidated
      const validatedSession = authService.validateSession(login2.session.id);
      expect(validatedSession).toBeNull();
    });
  });
});
