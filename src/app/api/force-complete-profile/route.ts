import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

// Force mark a profile as complete to prevent redirect loops
export async function GET() {
  try {
    // Create a secure server-side client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore 
    });
    
    // Get authenticated user (secure method)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User auth error in force-complete-profile:', userError);
      return NextResponse.json({ 
        success: false,
        error: userError?.message || 'User not authenticated'
      }, { status: 401 });
    }
    
    console.log(`[API] Force completing profile for user ${user.id} (${user.email})`);
    
    // Get current profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('username, full_name, id')
      .eq('id', user.id)
      .single();
      
    // If no profile exists, create one
    if (fetchError || !profile) {
      console.log(`Creating basic profile for ${user.id}`);
      
      // Generate username from email if needed
      const username = user.email?.split('@')[0] || `user_${Date.now().toString().slice(-6)}`;
      
      // Create basic profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username,
          full_name: username, // Use username as fallback full name
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url // Add avatar URL from user metadata
        })
        .select()
        .single();
        
      if (createError) {
        console.error('Failed to create profile:', createError);
        return NextResponse.json({ 
          success: false,
          error: 'Failed to create profile'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'New profile created and marked as complete',
        profile: newProfile
      });
    }
    
    // Profile exists, ensure it has at least username
    const updates: any = {};
    let updated = false;
    
    if (!profile.username || profile.username.trim() === '') {
      // Generate username from email
      updates.username = user.email?.split('@')[0] || `user_${Date.now().toString().slice(-6)}`;
      updated = true;
    }
    
    if (!profile.full_name || profile.full_name.trim() === '') {
      // Use username as fallback
      updates.full_name = profile.username || updates.username;
      updated = true;
    }
    
    // Update if needed
    if (updated) {
      updates.updated_at = new Date().toISOString();
      
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
        
      if (updateError) {
        console.error('Failed to update profile:', updateError);
        return NextResponse.json({ 
          success: false,
          error: 'Failed to update profile'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Profile updated and marked as complete',
        profile: updatedProfile
      });
    }
    
    // Already complete
    return NextResponse.json({
      success: true,
      message: 'Profile already complete',
      profile
    });
    
  } catch (error: any) {
    console.error('Error in force-complete-profile API:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 