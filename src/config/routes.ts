/**
 * Route Definitions
 * Centralized route path constants for type-safe navigation.
 */

export const ROUTES = {
  // Public
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',

  // Content
  ARTICLES: '/articles',
  ARTICLE_DETAIL: '/articles/:slug',
  TUTORIALS: '/tutorials',
  NEWS: '/news',
  RESEARCH: '/research',

  // Taxonomy
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: '/categories/:slug',
  TAGS: '/tags',
  TAG_DETAIL: '/tags/:slug',
  TOPICS: '/topics',

  // Intelligence
  THREAT_INTEL: '/threat-intelligence',
  CVE_DATABASE: '/cve',
  CVE_DETAIL: '/cve/:id',

  // Tools
  TOOLS: '/tools',
  TOOL_DETAIL: '/tools/:slug',

  // Academy
  ACADEMY: '/academy',
  COURSES: '/academy/courses',
  COURSE_DETAIL: '/academy/courses/:slug',
  LABS: '/academy/labs',
  LAB_DETAIL: '/academy/labs/:slug',

  // Community
  COMMUNITY: '/community',
  JOBS: '/jobs',
  JOB_DETAIL: '/jobs/:id',
  EVENTS: '/events',
  EVENT_DETAIL: '/events/:id',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  // User
  PROFILE: '/profile',
  SETTINGS: '/settings',
  DASHBOARD: '/dashboard',

  // Admin
  ADMIN: '/admin',
  ADMIN_ARTICLES: '/admin/articles',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_AUDIT: '/admin/audit',
} as const;

export type RouteKey = keyof typeof ROUTES;
