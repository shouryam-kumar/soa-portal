import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

// Securely check profile completion status using server auth
export async function GET() {
  try {
    // Create a secure server-side client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get authenticated user (secure method)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User auth error in check-profile:', userError);
      return NextResponse.json({ 
        authenticated: false,
        complete: false,
        error: userError?.message || 'User not authenticated'
      }, { status: 401 });
    }
    
    console.log(`[API] Checking profile for user ${user.id} (${user.email})`);
    
    // Check profile directly from the database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, full_name, id, created_at, updated_at')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile in check-profile API:', profileError);
      
      // Special handling for "no rows" error - create a basic profile
      if (profileError.code === 'PGRST116') {
        console.log(`[API] Profile not found for ${user.id}, creating a basic one`);
        
        // Create a minimal profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            email: user.email
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Failed to create basic profile:', createError);
          return NextResponse.json({ 
            authenticated: true,
            complete: false,
            error: 'Failed to create profile',
            profile_status: 'creation_failed'
          }, { status: 500 });
        }
        
        // Return the newly created profile, but mark as incomplete
        return NextResponse.json({
          authenticated: true,
          complete: false,
          profile: newProfile,
          message: 'New profile created',
          profile_status: 'new_profile_created'
        });
      }
      
      return NextResponse.json({ 
        authenticated: true,
        complete: false,
        error: profileError.message,
        profile_status: 'fetch_error'
      }, { status: 500 });
    }
    
    // Check if profile is complete
    const isComplete = !!(
      (profile?.username && profile.username.trim() !== '') || 
      (profile?.full_name && profile.full_name.trim() !== '')
    );
    
    console.log(`[API] Profile check: ${isComplete ? 'COMPLETE' : 'INCOMPLETE'} - Username: "${profile?.username}", Full name: "${profile?.full_name}"`);
    
    return NextResponse.json({
      authenticated: true,
      complete: isComplete,
      profile: profile || null,
      profile_status: isComplete ? 'complete' : 'incomplete'
    });
    
  } catch (error: any) {
    console.error('Error in profile check API:', error);
    return NextResponse.json({ 
      authenticated: false,
      complete: false,
      error: error.message,
      profile_status: 'error'
    }, { status: 500 });
  }
} 