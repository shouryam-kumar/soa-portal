// src/app/(auth)/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  
  if (error) {
    console.error(`Auth error: ${error} - ${errorDescription}`);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || 'Authentication error')}`, request.url)
    );
  }
  
  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    try {
      // Exchange the code for a session
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError) throw sessionError;
      
      if (data?.session) {
        // Check if the user has a complete profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.session.user.id)
          .single();
        
        // If no profile or incomplete profile, redirect to complete-profile
        if (!profile || !profile.username) {
          return NextResponse.redirect(new URL('/complete-profile', request.url));
        }
      }
      
      // Redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (err) {
      console.error('Session exchange error:', err);
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }
  }

  return NextResponse.redirect(new URL('/login', request.url));
}