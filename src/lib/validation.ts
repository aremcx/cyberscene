/**
 * Validation Utilities
 * Centralized input validation with detailed error messages.
 */

import { ValidationError } from './errors';

type ValidationRule<T> = {
  field: keyof T;
  validate: (value: unknown) => boolean;
  message: string;
};

type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string[]>;
};

/**
 * Schema-based validator
 */
export class Validator<T extends Record<string, unknown>> {
  private rules: ValidationRule<T>[] = [];

  addRule(field: keyof T, validate: (value: unknown) => boolean, message: string): this {
    this.rules.push({ field, validate, message });
    return this;
  }

  required(field: keyof T, message?: string): this {
    return this.addRule(
      field,
      (value) => value !== null && value !== undefined && value !== '',
      message || `${String(field)} is required`
    );
  }

  minLength(field: keyof T, min: number, message?: string): this {
    return this.addRule(
      field,
      (value) => typeof value === 'string' && value.length >= min,
      message || `${String(field)} must be at least ${min} characters`
    );
  }

  maxLength(field: keyof T, max: number, message?: string): this {
    return this.addRule(
      field,
      (value) => typeof value === 'string' && value.length <= max,
      message || `${String(field)} must be at most ${max} characters`
    );
  }

  email(field: keyof T, message?: string): this {
    return this.addRule(
      field,
      (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message || `${String(field)} must be a valid email address`
    );
  }

  slug(field: keyof T, message?: string): this {
    return this.addRule(
      field,
      (value) => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      message || `${String(field)} must be a valid slug (lowercase letters, numbers, hyphens)`
    );
  }

  enum(field: keyof T, values: readonly string[], message?: string): this {
    return this.addRule(
      field,
      (value) => typeof value === 'string' && values.includes(value),
      message || `${String(field)} must be one of: ${values.join(', ')}`
    );
  }

  uuid(field: keyof T, message?: string): this {
    return this.addRule(
      field,
      (value) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
      message || `${String(field)} must be a valid UUID`
    );
  }

  validate(data: T): ValidationResult {
    const errors: Record<string, string[]> = {};

    for (const rule of this.rules) {
      const value = data[rule.field];
      if (!rule.validate(value)) {
        if (!errors[rule.field as string]) {
          errors[rule.field as string] = [];
        }
        errors[rule.field as string].push(rule.message);
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate and throw ValidationError if invalid
   */
  validateOrThrow(data: T): void {
    const result = this.validate(data);
    if (!result.isValid) {
      throw new ValidationError('Validation failed', result.errors);
    }
  }
}

// ============================================
// PREDEFINED VALIDATORS
// ============================================

export const validators = {
  createUser: new Validator<{ email: string; displayName: string; password: string }>()
    .required('email')
    .email('email')
    .required('displayName')
    .minLength('displayName', 2)
    .maxLength('displayName', 100)
    .required('password')
    .minLength('password', 8, 'Password must be at least 8 characters')
    .maxLength('password', 128),

  createArticle: new Validator<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    authorId: string;
  }>()
    .required('title')
    .minLength('title', 10)
    .maxLength('title', 300)
    .required('slug')
    .slug('slug')
    .required('excerpt')
    .minLength('excerpt', 20)
    .maxLength('excerpt', 500)
    .required('content')
    .minLength('content', 100)
    .required('authorId')
    .uuid('authorId'),

  createComment: new Validator<{ content: string; articleId: string; authorId: string }>()
    .required('content')
    .minLength('content', 3)
    .maxLength('content', 2000)
    .required('articleId')
    .uuid('articleId')
    .required('authorId')
    .uuid('authorId'),

  createCategory: new Validator<{ name: string; slug: string }>()
    .required('name')
    .minLength('name', 2)
    .maxLength('name', 100)
    .required('slug')
    .slug('slug'),

  createTag: new Validator<{ name: string; slug: string }>()
    .required('name')
    .minLength('name', 2)
    .maxLength('name', 50)
    .required('slug')
    .slug('slug'),
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate an email address
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate a slug
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Validate a UUID
 */
export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  issues: string[];
} {
  const issues: string[] = [];

  if (password.length < 8) issues.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) issues.push('At least one uppercase letter');
  if (!/[a-z]/.test(password)) issues.push('At least one lowercase letter');
  if (!/[0-9]/.test(password)) issues.push('At least one number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) issues.push('At least one special character');

  const strength =
    issues.length === 0 ? 'strong' : issues.length <= 2 ? 'medium' : 'weak';

  return {
    isValid: issues.length === 0,
    strength,
    issues,
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
