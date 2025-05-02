import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // If there's an error, redirect to login with the error
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  
  if (error) {
    console.error('Authentication error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`, 
      request.url)
    );
  }
  
  if (code) {
    const supabase = createRouteHandlerClient<any>({ cookies });
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
    
    // Get the current session to see if it worked
    const { data: { session } } = await supabase.auth.getSession();
    
    // If we have a session, try to create a profile if it doesn't exist
    if (session?.user) {
      try {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();
          
        if (!existingProfile) {
          // Extract data from user
          const username = session.user.user_metadata?.name 
            || session.user.user_metadata?.full_name 
            || session.user.email?.split('@')[0] 
            || `user-${Math.random().toString(36).substring(2, 8)}`;
            
          const avatarUrl = session.user.user_metadata?.avatar_url;
          
          // Create the profile
          await supabase.from('profiles').insert({
            id: session.user.id,
            username,
            avatar_url: avatarUrl,
            email: session.user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Error creating profile:', err);
        // We'll continue even if profile creation fails
      }
    }
  }
  
  // Redirect to the home page
  return NextResponse.redirect(new URL('/', request.url));
} 