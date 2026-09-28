/**
 * Permission Definitions
 * Centralized permission registry for the application.
 * Each permission is scoped to a module for scalability.
 */

import { ROLES, type Role } from '../config/constants';

// Permission modules
export const PERMISSION_MODULES = {
  CONTENT: 'content',
  USERS: 'users',
  SYSTEM: 'system',
  COMMUNITY: 'community',
  INTELLIGENCE: 'intelligence',
  ACADEMY: 'academy',
} as const;

// Permission definitions
export const PERMISSIONS = {
  // Content permissions
  'content:read': 'View content',
  'content:create': 'Create new content',
  'content:edit:own': 'Edit own content',
  'content:edit:any': 'Edit any content',
  'content:delete:own': 'Delete own content',
  'content:delete:any': 'Delete any content',
  'content:publish': 'Publish content',
  'content:feature': 'Feature content',

  // User permissions
  'users:read': 'View user profiles',
  'users:manage': 'Manage user accounts',
  'users:assign_role': 'Assign roles to users',
  'users:ban': 'Ban users',

  // System permissions
  'system:settings': 'Manage system settings',
  'system:audit': 'View audit logs',
  'system:admin': 'Full admin access',

  // Community permissions
  'community:read': 'View community content',
  'community:post': 'Create community posts',
  'community:moderate': 'Moderate community content',

  // Intelligence permissions
  'intelligence:read': 'View threat intelligence',
  'intelligence:create': 'Submit threat reports',
  'intelligence:manage': 'Manage intelligence entries',

  // Academy permissions
  'academy:read': 'View courses and labs',
  'academy:create': 'Create courses',
  'academy:manage': 'Manage academy content',
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Role → Permission mapping
 * Defines which permissions each role has.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.keys(PERMISSIONS) as Permission[],
  
  [ROLES.ADMIN]: [
    'content:read', 'content:create', 'content:edit:any', 'content:delete:any',
    'content:publish', 'content:feature',
    'users:read', 'users:manage', 'users:assign_role',
    'community:read', 'community:moderate',
    'intelligence:read', 'intelligence:manage',
    'academy:read', 'academy:create', 'academy:manage',
    'system:audit',
  ],

  [ROLES.EDITOR]: [
    'content:read', 'content:create', 'content:edit:any', 'content:delete:own',
    'content:publish', 'content:feature',
    'community:read', 'community:moderate',
    'intelligence:read',
    'academy:read',
  ],

  [ROLES.AUTHOR]: [
    'content:read', 'content:create', 'content:edit:own', 'content:delete:own',
    'community:read', 'community:post',
    'intelligence:read',
    'academy:read',
  ],

  [ROLES.CONTRIBUTOR]: [
    'content:read', 'content:create', 'content:edit:own',
    'community:read', 'community:post',
    'intelligence:read',
    'academy:read',
  ],

  [ROLES.MODERATOR]: [
    'content:read',
    'community:read', 'community:post', 'community:moderate',
    'users:read', 'users:ban',
    'intelligence:read',
    'academy:read',
  ],

  [ROLES.USER]: [
    'content:read',
    'community:read', 'community:post',
    'intelligence:read',
    'academy:read',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role is at least a certain level
 */
export function isRoleAtLeast(userRole: Role, minimumRole: Role): boolean {
  const hierarchy: Role[] = [
    ROLES.USER,
    ROLES.MODERATOR,
    ROLES.CONTRIBUTOR,
    ROLES.AUTHOR,
    ROLES.EDITOR,
    ROLES.ADMIN,
    ROLES.SUPER_ADMIN,
  ];

  const userLevel = hierarchy.indexOf(userRole);
  const minLevel = hierarchy.indexOf(minimumRole);

  return userLevel >= minLevel;
}
