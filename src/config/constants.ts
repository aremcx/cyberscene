/**
 * Application Constants
 * Centralized constants used throughout the application.
 */

export const APP_NAME = 'CyberVault';
export const APP_TAGLINE = 'Cybersecurity Intelligence Platform';
export const APP_DESCRIPTION =
  'Your comprehensive cybersecurity knowledge, intelligence, learning and community platform.';

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

// Content
export const ARTICLE_EXCERPT_LENGTH = 160;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Rate Limiting (client-side indicators)
export const RATE_LIMIT_WINDOW = 60_000; // 1 minute
export const MAX_REQUESTS_PER_WINDOW = 30;

// Roles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  AUTHOR: 'author',
  CONTRIBUTOR: 'contributor',
  MODERATOR: 'moderator',
  USER: 'user',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Article Status
export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type ArticleStatus = (typeof ARTICLE_STATUS)[keyof typeof ARTICLE_STATUS];

// Content Types
export const CONTENT_TYPES = {
  ARTICLE: 'article',
  TUTORIAL: 'tutorial',
  NEWS: 'news',
  RESEARCH: 'research',
  THREAT_INTEL: 'threat_intel',
  TOOL_REVIEW: 'tool_review',
} as const;
