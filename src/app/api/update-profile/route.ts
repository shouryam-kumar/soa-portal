import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

export async function POST(request: Request) {
  try {
    const { userId, username, fullName } = await request.json();
    
    if (!userId || !username || !fullName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create a Supabase client for server-side operations
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Directly update or insert the profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username,
        full_name: fullName,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        // Add a completion marker in the profile itself
        profile_completed: true,
        profile_completed_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single();
    
    if (error) {
      console.error('Profile update failed:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    // Get the user's auth info - might have metadata that's useful
    const { data: { user } } = await supabase.auth.getUser();
    
    // Update user metadata to include profile completion
    if (user) {
      await supabase.auth.updateUser({
        data: {
          profile_completed: true,
          username: username,
          full_name: fullName
        }
      });
    }
    
    return NextResponse.json({ 
      success: true,
      profile: data, 
      message: 'Profile updated successfully and marked as complete'
    });
  } catch (error: any) {
    console.error('Error in profile update API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 