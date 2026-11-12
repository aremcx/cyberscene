/**
 * Supabase Client
 * Typed Supabase client instance for database and auth operations.
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  console.warn(
    'CyberVault: Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(
  env.supabaseUrl || 'https://placeholder.supabase.co',
  env.supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-application-name': 'CyberVault',
      },
    },
  }
);
