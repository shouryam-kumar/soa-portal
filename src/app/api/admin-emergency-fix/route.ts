import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

// EMERGENCY endpoint to fix admin access issues
export async function GET(req: Request) {
  try {
    // Extract email param if provided (for admin override)
    const url = new URL(req.url);
    const adminEmail = url.searchParams.get('email');
    
    // Create a secure server-side client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Get authenticated user (secure method)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('ADMIN FIX: User auth error:', userError);
      return NextResponse.json({ 
        success: false,
        error: userError?.message || 'User not authenticated'
      }, { status: 401 });
    }
    
    console.log(`ADMIN FIX: Fixing admin access for user ${user.id} (${user.email})`);
    
    // Check if this is a legitimate admin email (add your admin emails here)
    // If adminEmail parameter is provided, use that for validation instead
    const isActualAdmin = 
      adminEmail ? 
      adminEmail === user.email : 
      user.email && (
        user.email.includes('@okto.org') || 
        user.email.endsWith('@okto.app') || 
        user.email === 'shouryam1508@gmail.com'
      );
    
    if (!isActualAdmin) {
      console.log('ADMIN FIX: User is not an authorized admin email');
      return NextResponse.json({ 
        success: false,
        error: 'Email not authorized for admin access'
      }, { status: 403 });
    }
    
    // Create a username based on email or timestamp
    const username = user.email?.split('@')[0] || `user_${Date.now().toString().slice(-6)}`;
    
    // Force update profile with is_admin flag
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: username,
        full_name: user.user_metadata?.full_name || username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_admin: true, // Set admin flag
      }, { onConflict: 'id' });
      
    if (upsertError) {
      console.error('ADMIN FIX: Failed to update profile:', upsertError);
      return NextResponse.json({ 
        success: false,
        error: 'Failed to update profile with admin privileges'
      }, { status: 500 });
    }
    
    // Return HTML with JS that redirects to admin page
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Admin Access Fix</title>
          <script>
            // Clear all session storage to reset any auth counters
            sessionStorage.clear();
            
            // Set profile completion flags
            localStorage.setItem('okto_profile_complete_${user.id}', 'true');
            localStorage.setItem('okto_profile_complete_global', 'true');
            localStorage.setItem('okto_admin_access_${user.id}', 'true');
            
            // Show message before redirect
            document.addEventListener('DOMContentLoaded', function() {
              document.getElementById('message').textContent = 'Admin access granted! Redirecting to admin panel...';
              
              // Redirect after a short delay
              setTimeout(function() {
                window.location.href = '/admin?admin_fix_applied=true&t=' + Date.now();
              }, 1000);
            });
          </script>
        </head>
        <body style="background-color: #111; color: #fff; font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
          <div style="text-align: center; max-width: 600px; margin: 0 auto; padding: 2rem;">
            <h1 style="color: #3b82f6;">Admin Access Fix</h1>
            <p id="message">Granting admin privileges...</p>
            <div style="margin-top: 2rem; padding: 1rem; background-color: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; border-radius: 0.5rem;">
              <p style="margin: 0; color: #93c5fd;">
                This utility has set your account as an admin in the database.
                If you continue to have issues, please contact technical support.
              </p>
            </div>
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
    console.error('ADMIN FIX: Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 