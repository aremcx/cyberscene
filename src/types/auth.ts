/**
 * Authentication Types
 * Type definitions for authentication and user management.
 */

import { Role } from '../config/constants';

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: Role;
  bio?: string;
  is_active: boolean;
  email_verified: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  display_name: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface RolePermissions {
  role: Role;
  permissions: string[];
}
