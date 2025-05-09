'use server';

import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

/**
 * Creates a Supabase client for server components with proper cookie handling
 */
export async function createServerClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ 
    cookies: () => cookieStore
  });
}

/**
 * Creates a Supabase client for API routes with proper cookie handling
 */
export async function createApiClient() {
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({ 
    cookies: () => cookieStore
  });
} 