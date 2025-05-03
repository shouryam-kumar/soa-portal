import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

/**
 * Middleware function for Supabase authentication
 * This handles the cookie correctly to avoid race conditions and middleware errors
 */
export async function updateSession(req: NextRequest) {
  // Create a response to modify
  const res = NextResponse.next();
  
  try {
    // Create the Supabase client specifically for middleware
    const supabase = createMiddlewareClient<Database>({
      req,
      res,
    });
    
    // This refreshes the session if needed and sets the cookies automatically
    // The cookies are handled internally by the middleware client
    await supabase.auth.getSession();
    
    return res;
  } catch (error) {
    console.error('Error in updateSession middleware:', error);
    return res;
  }
}

/**
 * Helper to safely create a Supabase client in server components
 * This adds robust error handling around the creation process
 */
export async function createServerSafeClient(cookieStore: any) {
  // Dynamically import to avoid SSR issues
  const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs');
  
  try {
    return createServerComponentClient<Database>({ 
      cookies: () => cookieStore 
    });
  } catch (error) {
    console.error('Error creating server component client:', error);
    throw new Error('Failed to initialize database client');
  }
}