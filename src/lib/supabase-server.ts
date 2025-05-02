'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client - only use in server components or server actions
 * This uses a more direct approach to avoid issues with cookies().get()
 */
export async function createServerClient() {
  // Using this basic approach instead of the more complex cookies API
  // This avoids the "cookies() should be awaited" error
  const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Just return the client without trying to get session from cookies
  return supabase;
}

/**
 * For situations where we need to use the server component client
 * Only use this in app directory server components
 */
export function createAppDirServerClient() {
  try {
    return createServerComponentClient<Database>({
      cookies
    });
  } catch (error) {
    console.error('Error creating server client:', error);
    // Fallback to basic client in case of errors
    return createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
} 