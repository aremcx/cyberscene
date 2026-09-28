/**
 * Environment Configuration
 * Centralized environment variable access with type safety.
 * All env vars should be accessed through this module.
 */

export const env = {
  // Supabase
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  // App
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  appName: 'CyberVault',

  // Feature Flags
  enableAI: import.meta.env.VITE_ENABLE_AI === 'true',
  enableNewsletter: import.meta.env.VITE_ENABLE_NEWSLETTER === 'true',
} as const;

export const isDev = env.appEnv === 'development';
export const isProd = env.appEnv === 'production';
