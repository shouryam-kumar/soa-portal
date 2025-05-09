'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Creates a client-side Supabase client
 * Safe to use in client components
 */
export function createBrowserClient() {
  return createClientComponentClient<Database>();
}

/**
 * Creates a direct Supabase client without using cookies
 * Useful as a fallback when cookies are causing issues
 */
export function createDirectClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Safely handles user authentication checking
 * Returns the user or null, with no exceptions thrown
 */
export async function getAuthenticatedUser(client: any) {
  try {
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Safely check if a profile exists and is complete
 */
export async function checkProfileComplete(client: any, userId: string) {
  try {
    const { data: profile, error } = await client
      .from('profiles')
      .select('username, full_name')
      .eq('id', userId)
      .single();
      
    if (error || !profile) return false;
    
    // Profile is complete if either username or full_name exists
    return !!(
      (profile.username && profile.username.trim() !== '') || 
      (profile.full_name && profile.full_name.trim() !== '')
    );
  } catch (error) {
    console.error('Error checking profile:', error);
    return false;
  }
} 