import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create a Supabase client for server-side operations
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    // Sign out the user
    await supabase.auth.signOut();

    // Redirect to the homepage with cache prevention
    const timestamp = Date.now();
    const response = NextResponse.redirect(
      new URL(`/?force_signout=api&t=${timestamp}`, 
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')
    );
    
    // Set no-cache headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    // Set cookie clearing instructions in response (for ALL cookies)
    // Auth cookies
    response.headers.append('Set-Cookie', 'sb-auth-token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
    response.headers.append('Set-Cookie', 'sb-access-token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
    response.headers.append('Set-Cookie', 'sb-refresh-token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
    response.headers.append('Set-Cookie', 'supabase-auth-token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
    
    return response;
    
  } catch (error) {
    console.error('Error in signout API:', error);
    
    // If there's an error, still try to redirect with cookie clearing
    const response = NextResponse.redirect(
      new URL(`/?emergency_signout=true&t=${Date.now()}`, 
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')
    );
    
    // Set no-cache headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Force clear cookies even on error
    response.headers.append('Set-Cookie', 'sb-auth-token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
    response.headers.append('Set-Cookie', 'sb-access-token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
    response.headers.append('Set-Cookie', 'sb-refresh-token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
    response.headers.append('Set-Cookie', 'supabase-auth-token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
    
    return response;
  }
} 