import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  console.log('Middleware executing for path:', path);
  
  // Exact list of public routes that don't require authentication
  const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/register',
    '/auth/callback',
    '/admin/login', // Allow admin login page without auth
  ];
  
  // Define protected routes that should always require auth
  const PROTECTED_ROUTES = [
    '/dashboard',
    '/profile',
    '/proposals',
    '/projects',
    '/rewards',
    '/bounties',
  ];
  
  // Admin routes are handled separately
  const isAdminRoute = path.startsWith('/admin');
  // Admin login is a special case
  const isAdminLogin = path === '/admin/login';
  
  // Check if path is protected (non-admin routes)
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // Check if path is public
  const isPublicRoute = PUBLIC_ROUTES.includes(path);
  
  // Check if path is a static asset
  const isStaticAsset = 
    path.startsWith('/_next/') || 
    path.startsWith('/images/') || 
    path.startsWith('/api/') ||
    path.includes('.') || // Has file extension
    path.startsWith('/favicon.ico');
  
  // Early return for static assets
  if (isStaticAsset) {
    return NextResponse.next();
  }
  
  // For public routes, just proceed
  if (isPublicRoute) {
    console.log('Public route detected:', path);
    return NextResponse.next();
  }
  
  console.log('Authentication check for path:', path);
  const res = NextResponse.next();
  
  try {
    // Create middleware client with explicit cookies handling
    const supabase = createMiddlewareClient<Database>({ req, res });
    
    // Get session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth error in middleware:', error.message);
      // For admin routes, redirect to admin login on auth error
      if (isAdminRoute) {
        return NextResponse.redirect(new URL('/admin/login?error=auth', req.url));
      }
      return NextResponse.redirect(new URL('/login?error=auth', req.url));
    }
    
    console.log('Session found:', session ? `Yes (${session.user.email})` : 'No');
    
    // Handle admin routes
    if (isAdminRoute) {
      // Allow access to admin login page without auth
      if (isAdminLogin) {
        return res;
      }
      
      // For admin routes without session, redirect to admin login
      if (!session) {
        console.log('Admin route accessed without auth, redirecting to admin login');
        // This is a key fix: redirect to admin login, not regular login
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
      
      // For all other admin routes, check auth and admin status
      console.log('Admin route detected, checking admin status');
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Profile query error:', error.message);
          return NextResponse.redirect(new URL('/admin/login?error=profile', req.url));
        }
        
        console.log('Admin check:', profile?.is_admin ? 'Yes' : 'No');
        
        if (!profile?.is_admin) {
          console.log('User is not admin, redirecting to admin login');
          return NextResponse.redirect(new URL('/admin/login?error=unauthorized', req.url));
        }
        
        console.log('User is admin, proceeding to admin route');
        return res;
      } catch (error) {
        console.error('Error checking admin status:', error);
        // On error, redirect to admin login
        return NextResponse.redirect(new URL('/admin/login?error=middleware', req.url));
      }
    }
    
    // For protected routes, enforce authentication
    if (isProtectedRoute && !session) {
      console.log('Protected route accessed without auth, redirecting to login');
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // All checks passed, continue with the request
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // On any error, redirect to appropriate login page
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/admin/login?error=middleware', req.url));
    }
    return NextResponse.redirect(new URL('/login?error=middleware', req.url));
  }
}

// Configure matcher for all paths
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};