import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  console.log('Middleware executing for path:', path);
  
  // Skip middleware for public and auth routes
  if (path.startsWith('/login') || 
      path.startsWith('/register') || 
      path.startsWith('/auth/callback') || 
      path === '/auth' || 
      path.startsWith('/auth/')) {
    console.log('Auth route detected, skipping middleware');
    return NextResponse.next();
  }
  
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    console.log('Session found:', session ? 'Yes' : 'No');
    
    if (!session) {
      console.log('No session, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // For admin routes, check if user is admin
    if (path.startsWith('/admin')) {
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
  } catch (error) {
    console.error('Middleware error:', error);
    // On any error, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Only include routes that should be protected
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/proposals/:path*',
    '/projects/:path*',
    '/rewards/:path*',
    '/admin/:path*'
  ],
};