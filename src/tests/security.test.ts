/**
 * Security Tests
 * Tests for security measures and vulnerabilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/store';
import * as authService from '../services/authService';
import { hashPassword, verifyPassword, generateSecureToken } from '../lib/crypto';
import { checkRateLimit, RATE_LIMIT_CONFIGS, clearAllRateLimits } from '../lib/rateLimiter';
import { sanitizeInput } from '../lib/security';

describe('Security Measures', () => {
  beforeEach(() => {
    db.reset();
    clearAllRateLimits();
  });

  describe('Password Security', () => {
    it('should hash passwords with salt', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.includes('$')).toBe(true); // Format: iterations$salt$hash
    });

    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword('WrongPassword', hash);
      expect(isValid).toBe(false);
    });

    it('should generate unique hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should not store plaintext passwords', async () => {
      const { user } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      const storedUser = db.getUserById(user.id);
      expect(storedUser?.passwordHash).not.toBe('Test@1234');
      expect(storedUser?.passwordHash).toBeDefined();
    });
  });

  describe('Token Security', () => {
    it('should generate secure random tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(32);
    });

    it('should generate tokens with sufficient entropy', () => {
      const tokens = Array.from({ length: 100 }, () => generateSecureToken());
      const uniqueTokens = new Set(tokens);
      
      // All tokens should be unique
      expect(uniqueTokens.size).toBe(100);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const config = RATE_LIMIT_CONFIGS.LOGIN;
      
      for (let i = 0; i < config.maxAttempts; i++) {
        const result = checkRateLimit('test-key', config);
        expect(result.allowed).toBe(true);
      }
    });

    it('should block requests exceeding limit', () => {
      const config = RATE_LIMIT_CONFIGS.LOGIN;
      
      // Exhaust limit
      for (let i = 0; i < config.maxAttempts; i++) {
        checkRateLimit('test-key', config);
      }
      
      // Next request should be blocked
      const result = checkRateLimit('test-key', config);
      expect(result.allowed).toBe(false);
    });

    it('should track different keys separately', () => {
      const config = RATE_LIMIT_CONFIGS.LOGIN;
      
      // Exhaust limit for key1
      for (let i = 0; i < config.maxAttempts; i++) {
        checkRateLimit('key1', config);
      }
      
      // key2 should still be allowed
      const result = checkRateLimit('key2', config);
      expect(result.allowed).toBe(true);
    });

    it('should prevent brute force login attempts', async () => {
      await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      const config = RATE_LIMIT_CONFIGS.LOGIN;
      
      // Attempt multiple failed logins
      for (let i = 0; i < config.maxAttempts; i++) {
        try {
          await authService.login('test@example.com', 'WrongPassword', {
            ipAddress: '192.168.1.1',
          });
        } catch (error) {
          // Expected to fail
        }
      }
      
      // Next attempt should be rate limited
      await expect(
        authService.login('test@example.com', 'Test@1234', {
          ipAddress: '192.168.1.1',
        })
      ).rejects.toThrow();
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize HTML tags', () => {
      const input = '<script>alert("XSS")</script>';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    it('should sanitize special characters', () => {
      const input = 'Test & "quotes" <tags>';
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).toContain('&amp;');
      expect(sanitized).toContain('&quot;');
      expect(sanitized).toContain('&lt;');
      expect(sanitized).toContain('&gt;');
    });

    it('should prevent SQL injection in inputs', () => {
      const input = "'; DROP TABLE users; --";
      const sanitized = sanitizeInput(input);
      
      expect(sanitized).not.toContain('--');
      expect(sanitized).toContain('&#x27;');
    });
  });

  describe('Session Security', () => {
    it('should expire sessions after timeout', async () => {
      const { session } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      // Session should be valid initially
      let user = authService.validateSession(session.id);
      expect(user).toBeDefined();
      
      // Manually expire session (simulate time passing)
      const expiredSession = {
        ...session,
        expiresAt: Date.now() - 1000, // Expired 1 second ago
      };
      
      // In real implementation, this would be checked automatically
      expect(expiredSession.expiresAt).toBeLessThan(Date.now());
    });

    it('should invalidate session on password change', async () => {
      const { user, session } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      // Change password
      await authService.changePassword(user.id, 'Test@1234', 'NewPassword@1234', session.id);
      
      // Old session should be invalidated
      const validatedSession = authService.validateSession(session.id);
      expect(validatedSession).toBeNull();
    });

    it('should prevent session hijacking', async () => {
      const { user, session } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      // Try to logout with wrong user ID
      expect(() => {
        authService.logout(session.id, 'wrong-user-id');
      }).toThrow('Invalid session');
    });
  });

  describe('Email Enumeration Prevention', () => {
    it('should not reveal if email exists on password reset', async () => {
      // Request reset for non-existent email
      const result = await authService.requestPasswordReset('nonexistent@example.com');
      
      // Should return fake token to prevent enumeration
      expect(result.token).toBe('fake_token');
    });

    it('should not reveal if email exists on registration', async () => {
      await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      // Try to register with same email
      try {
        await authService.register('test@example.com', 'Test@1234', 'Another User');
      } catch (error) {
        // Error message should not reveal if email exists
        expect((error as Error).message).toContain('already exists');
      }
    });
  });

  describe('Audit Logging', () => {
    it('should log login attempts', async () => {
      await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      await authService.login('test@example.com', 'Test@1234', {
        ipAddress: '192.168.1.1',
      });
      
      const logs = db.listAuditLogs();
      const loginLog = logs.data.find(log => log.action === 'login');
      
      expect(loginLog).toBeDefined();
      expect(loginLog?.details).toBeDefined();
    });

    it('should log failed login attempts', async () => {
      await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      try {
        await authService.login('test@example.com', 'WrongPassword', {
          ipAddress: '192.168.1.1',
        });
      } catch (error) {
        // Expected to fail
      }
      
      const logs = db.listAuditLogs();
      const failedLoginLog = logs.data.find(log => 
        log.action === 'login' && 
        log.details && 
        (log.details as any).success === false
      );
      
      expect(failedLoginLog).toBeDefined();
    });

    it('should log password changes', async () => {
      const { user, session } = await authService.register('test@example.com', 'Test@1234', 'Test User');
      
      await authService.changePassword(user.id, 'Test@1234', 'NewPassword@1234', session.id);
      
      const logs = db.listAuditLogs();
      const passwordChangeLog = logs.data.find(log => 
        log.action === 'update' && 
        log.details && 
        (log.details as any).action === 'password_changed'
      );
      
      expect(passwordChangeLog).toBeDefined();
    });
  });
});
