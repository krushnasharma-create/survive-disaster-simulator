// src/services/authService.ts
// Handles authentication lifecycle using Supabase GoTrue Auth.
// Enforces client-side validation and sanitized error reporting.

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  createdAt: string;
}

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,24}$/;

export function validateUsername(username: string): { valid: boolean; error?: string } {
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 24) {
    return { valid: false, error: 'Username must be between 3 and 24 characters.' };
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores.' };
  }
  return { valid: true };
}

function sanitizeAuthError(err: unknown): string {
  if (!err || typeof err !== 'object') {
    return 'An unexpected error occurred. Please try again.';
  }
  const message = 'message' in err && typeof (err as { message: unknown }).message === 'string'
    ? (err as { message: string }).message
    : '';

  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password.';
  }
  if (message.includes('User already registered') || message.includes('unique constraint') || message.includes('already exists')) {
    return 'An account with this email or username already exists.';
  }
  if (message.includes('Password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  if (message.includes('rate limit')) {
    return 'Too many attempts. Please wait a few moments and try again.';
  }
  return 'Unable to complete authentication. Please verify your details.';
}

export async function signUp(
  email: string,
  password: string,
  username: string,
  displayName?: string
): Promise<AuthResult<{ user: User | null; session: Session | null }>> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Authentication service is not configured in this environment.' };
  }

  const usernameCheck = validateUsername(username);
  if (!usernameCheck.valid) {
    return { success: false, error: usernameCheck.error };
  }

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  try {
    const trimmedUsername = username.trim();
    const trimmedDisplayName = displayName?.trim() || trimmedUsername;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          username: trimmedUsername,
          display_name: trimmedDisplayName,
        },
      },
    });

    if (error) {
      return { success: false, error: sanitizeAuthError(error) };
    }

    return {
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    };
  } catch (err) {
    return { success: false, error: sanitizeAuthError(err) };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthResult<{ user: User | null; session: Session | null }>> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Authentication service is not configured in this environment.' };
  }

  if (!email || !password) {
    return { success: false, error: 'Please enter both email and password.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { success: false, error: sanitizeAuthError(error) };
    }

    return {
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    };
  } catch (err) {
    return { success: false, error: sanitizeAuthError(err) };
  }
}

export async function signOut(): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: sanitizeAuthError(error) };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: sanitizeAuthError(err) };
  }
}

export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }
  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

export function subscribeToAuthChanges(
  callback: (event: string, session: Session | null) => void
): { unsubscribe: () => void } {
  if (!isSupabaseConfigured || !supabase) {
    return { unsubscribe: () => {} };
  }

  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return {
    unsubscribe: () => {
      authListener.subscription.unsubscribe();
    },
  };
}

export async function fetchCurrentProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return null;
  }
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return {
      id: data.id,
      username: data.username,
      displayName: data.display_name,
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}
