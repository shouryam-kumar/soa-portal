import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

export async function middleware(req: NextRequest) {
  console.log('Middleware executing for path:', req.nextUrl.pathname);
  
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  
  // Get the user session (this will await the cookie operations)
  const { data: { session } } = await supabase.auth.getSession();
  
  console.log('Session found:', session ? 'Yes' : 'No');
  
  // Check if user is authenticated
  if (!session) {
    console.log('No session, redirecting to login');
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // For admin routes, check if user is admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    console.log('Admin route detected, checking admin status');
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
      
      console.log('Profile query result:', { profile, error });
      
      if (!profile?.is_admin) {
        console.log('User is not admin, redirecting to home page');
        return NextResponse.redirect(new URL('/', req.url));
      }
      
      console.log('User is admin, proceeding to admin route');
    } catch (error) {
      console.error('Error checking admin status:', error);
      // On error, redirect to home page for safety
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  return res;
}

export const config = {
  matcher: [
    // Match all admin routes
    '/admin/:path*',
    // Match other protected routes
    '/dashboard/:path*',
    '/profile/:path*',
    '/proposals/:path*',
    '/projects/:path*',
    '/rewards/:path*',
    // Exclude API routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};