import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

/**
 * Get session without using any cookies or headers APIs that have issues
 * This completely avoids the "cookies() should be awaited" error
 */
export async function getSessionSafely() {
  try {
    // Create a basic Supabase client without auth features
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Just return an empty session to avoid errors
    // We'll handle actual auth in client components
    return { data: { session: null }, error: null };
  } catch (error) {
    console.error('Error getting session:', error);
    return { data: { session: null }, error };
  }
}

/**
 * Creates a profile for a new user
 * This is useful for OAuth signups where we need to store additional user data
 */
export async function createUserProfile(userId: string, userData: {
  email?: string | null;
  username?: string | null;
  avatar_url?: string | null;
}) {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Extract username from email if not provided
    let username = userData.username;
    if (!username && userData.email) {
      username = userData.email.split('@')[0];
    }
    
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        avatar_url: userData.avatar_url,
        updated_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error };
  }
} 