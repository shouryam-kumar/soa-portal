import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

// EMERGENCY endpoint to fix profile redirect loops
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
      console.error('EMERGENCY FIX: User auth error:', userError);
      return NextResponse.json({ 
        success: false,
        error: userError?.message || 'User not authenticated'
      }, { status: 401 });
    }
    
    console.log(`EMERGENCY FIX: Forcing profile completion for user ${user.id}`);
    
    // Create a username based on email or timestamp
    const username = user.email?.split('@')[0] || `user_${Date.now().toString().slice(-6)}`;
    
    // Force update or create profile with essential fields
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: username,
        full_name: username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      
    if (upsertError) {
      console.error('EMERGENCY FIX: Failed to update profile:', upsertError);
      return NextResponse.json({ 
        success: false,
        error: 'Failed to update profile'
      }, { status: 500 });
    }
    
    // Return HTML with JS that sets localStorage flags and redirects
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Emergency Profile Fix</title>
          <script>
            // Clear all session storage to reset redirect counters
            sessionStorage.clear();
            
            // Set profile completion flags
            localStorage.setItem('okto_profile_complete_${user.id}', 'true');
            localStorage.setItem('okto_profile_complete_global', 'true');
            
            // Show message before redirect
            document.addEventListener('DOMContentLoaded', function() {
              document.getElementById('message').textContent = 'Profile fixed! Redirecting to dashboard...';
              
              // Redirect after a short delay
              setTimeout(function() {
                window.location.href = '/dashboard?emergency_fix_applied=true&t=' + Date.now();
              }, 1000);
            });
          </script>
        </head>
        <body style="background-color: #111; color: #fff; font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
          <div style="text-align: center;">
            <h1>Emergency Profile Fix</h1>
            <p id="message">Applying fix...</p>
          </div>
        </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
    
  } catch (error: any) {
    console.error('EMERGENCY FIX: Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 