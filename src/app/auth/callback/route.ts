import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/database.types';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  
  // Handle error query parameter
  if (error) {
    console.error('Auth error from provider:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || 'Authentication failed')}`, requestUrl.origin)
    );
  }
  
  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient<Database>({ 
        cookies: async () => cookieStore 
      });
      
      // Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError);
        throw exchangeError;
      }
      
      if (data?.session) {
        // Check if the user has a profile
        const userId = data.session.user.id;
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .eq('id', userId)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }
        
        // If no profile exists, create one with basic info 
        // (will be completed in the complete-profile page)
        if (!profileData) {
          const user = data.session.user;
          
          // Prepare username from email or name
          const suggestedUsername = user.user_metadata?.name || 
            user.email?.split('@')[0] || 
            'user' + Math.floor(Math.random() * 10000);
          
          // Construct profile data
          const profileInsert = {
            id: user.id,
            username: suggestedUsername,
            email: user.email,
            avatar_url: user.user_metadata?.avatar_url,
            created_at: new Date().toISOString(),
            okto_points: 0
          };
          
          // Insert profile data
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profileInsert);
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
          
          // For new users, always redirect to complete profile
          return NextResponse.redirect(new URL('/complete-profile', requestUrl.origin));
        }
        
        // If profile exists but username or full_name is missing, redirect to complete profile
        if (!profileData.username || profileData.username.trim() === '' || 
            !profileData.full_name || profileData.full_name.trim() === '') {
          return NextResponse.redirect(new URL('/complete-profile', requestUrl.origin));
        }
      }
      
      // Default redirect to dashboard for existing users with complete profiles
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
    } catch (error) {
      console.error('Error during auth callback:', error);
      return NextResponse.redirect(new URL('/login?error=callback_error', requestUrl.origin));
    }
  }
  
  // If no code is provided, redirect to login page
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
} 