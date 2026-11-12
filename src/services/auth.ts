/**
 * Auth Service
 * Handles authentication operations via Supabase Auth.
 * Provides a clean interface for login, register, session management.
 */

import { supabase } from '../lib/supabase';
import type { LoginCredentials, RegisterData, User } from '../types';
import { withApiResponse } from './api';

/**
 * Sign in with email and password
 */
export async function signIn(credentials: LoginCredentials) {
  return withApiResponse(async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw new Error(error.message);
    return data;
  });
}

/**
 * Register a new user
 */
export async function signUp(userData: RegisterData) {
  return withApiResponse(async () => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          display_name: userData.display_name,
        },
      },
    });

    if (error) throw new Error(error.message);
    return data;
  });
}

/**
 * Sign out the current user
 */
export async function signOut() {
  return withApiResponse(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  });
}

/**
 * Get the current session
 */
export async function getSession() {
  return withApiResponse(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session;
  });
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch extended user profile from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email || '',
    display_name: profile?.display_name || user.user_metadata?.display_name || '',
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
    role: profile?.role || 'user',
    bio: profile?.bio,
    is_active: profile?.is_active ?? true,
    email_verified: user.email_confirmed_at != null,
    last_login_at: profile?.last_login_at,
    created_at: user.created_at,
    updated_at: profile?.updated_at || user.created_at,
  };
}

/**
 * Request a password reset email
 */
export async function requestPasswordReset(email: string) {
  return withApiResponse(async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
  });
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
