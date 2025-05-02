import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { Database } from '@/types/database.types';

/**
 * Middleware function for Supabase authentication
 * This properly handles cookies in a way compatible with Next.js dynamic APIs
 */
export async function updateSession(req: NextRequest) {
  try {
    const res = NextResponse.next();
    
    // Create the Supabase client specifically for middleware
    const supabase = createMiddlewareClient<Database>({
      req,
      res,
    });
    
    // This will refresh the session if it's expired
    // The cookies are handled internally by the middleware client
    await supabase.auth.getSession();
    
    return res;
  } catch (error) {
    console.error('Error in updateSession middleware:', error);
    // Return next response to avoid breaking the application
    return NextResponse.next();
  }
}