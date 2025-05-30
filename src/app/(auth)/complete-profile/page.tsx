// src/app/(auth)/complete-profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import type { Database } from '@/types/database.types';

// ClientOnly wrapper to prevent server-side rendering errors
import dynamic from 'next/dynamic';

const ClientOnlyCompleteProfile = dynamic(() => Promise.resolve(CompleteProfile), {
  ssr: false,
});

export default function Page() {
  return <ClientOnlyCompleteProfile />;
}

// Add manual override button to directly access form
function ForceProfileForm({ session, router, supabase }: { 
  session: any, 
  router: any, 
  supabase: any 
}) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirect, setRedirect] = useState<string | null>(null);

  // Get redirect source if any
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('redirect')) setRedirect('page');
      else if (params.has('freshlogin')) setRedirect('login');
      else if (params.has('initial')) setRedirect('session');
    }
  }, []);

  // Pre-fill with data from session if available
  useEffect(() => {
    if (session?.user) {
      if (session.user.email) {
        setUsername(session.user.email.split('@')[0]);
      }
      if (session.user.user_metadata?.name) {
        setFullName(session.user.user_metadata.name);
      }
    }
  }, [session]);

  // Aggressive direct submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!session?.user?.id) {
      setError('Not authenticated. Please try logging in again.');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Using dedicated API route to update profile...');
      
      // Call our dedicated API route instead of direct database access
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          username,
          fullName
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }
      
      console.log('Profile updated successfully via API, redirecting to dashboard');
      
      // Force a hard navigation with a timestamp to ensure cache busting
      // and add profile_completed flag to prevent redirect loops
      const timestamp = Date.now();
      window.location.href = `/dashboard?profile_completed=true&t=${timestamp}`;
      
    } catch (error: any) {
      console.error('Profile submission error:', error);
      setError(error.message || 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          
          {redirect && (
            <div className="mt-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg text-blue-200 text-sm">
              {redirect === 'login' && (
                <p>Welcome! Please complete your profile information before continuing.</p>
              )}
              {redirect === 'page' && (
                <p>Profile completion is required before you can access other pages.</p>
              )}
              {redirect === 'session' && (
                <p>Your profile information is incomplete. Please fill in the required details.</p>
              )}
              <p className="mt-2 font-medium">This is a mandatory step to access the platform.</p>
            </div>
          )}
          
          <p className="text-gray-400 mt-4">
            Please provide your username and full name to continue
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-900 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-2">
              Full Name *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              minLength={2}
              className="appearance-none block w-full px-3 py-2 border-gray-700 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              minLength={3}
              className="appearance-none block w-full px-3 py-2 border-gray-700 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
            />
            <p className="text-xs text-gray-400 mt-1">
              Username must be at least 3 characters and can contain letters, numbers, and underscores.
            </p>
          </div>

          <button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

function CompleteProfile() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const [showDirectForm, setShowDirectForm] = useState(false); // New state for showing form directly
  const { session, user, isLoading: authLoading, refreshSession } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient<Database>();

  // Show try again button after a delay
  useEffect(() => {
    if (isLoading || authLoading) {
      const timer = setTimeout(() => {
        setShowTryAgain(true);
      }, 3000); // Show after 3 seconds (reduced from 5)
      
      return () => clearTimeout(timer);
    } else {
      setShowTryAgain(false);
    }
  }, [isLoading, authLoading]);
  
  // Force recovery after a longer delay
  useEffect(() => {
    const forceRecoveryTimer = setTimeout(() => {
      if ((isLoading || authLoading) && !recoveryAttempted) {
        console.log('Forcing profile recovery after timeout');
        setRecoveryAttempted(true);
        
        if (session?.user?.id) {
          // Force create profile
          (async () => {
            try {
              await supabase
                .from('profiles')
                .upsert({
                  id: session.user.id,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  username: session.user.email?.split('@')[0] || `user_${Date.now().toString().slice(-6)}`,
                  avatar_url: session.user.user_metadata?.avatar_url
                }, { onConflict: 'id' });
              
              setIsLoading(false);
              console.log('Recovery profile created');
              
              // Force reload after recovery
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            } catch (err: unknown) {
              console.error('Recovery failed:', err);
              setIsLoading(false);
              setError('Profile recovery failed. Please refresh and try again.');
            }
          })();
        } else {
          setIsLoading(false);
          setError('Could not recover profile - no valid session. Please log in again.');
        }
      }
    }, 8000); // Aggressive recovery after 8 seconds
    
    return () => clearTimeout(forceRecoveryTimer);
  }, [isLoading, authLoading, recoveryAttempted, session, supabase]);

  // Verify authentication on component mount
  useEffect(() => {
    console.log('Auth loading state changed:', authLoading);
    
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // First check if we need to manually refresh the session
        if (!session || !user) {
          console.log('No session or user, attempting refresh');
          await refreshSession();
        }
        
        // If auth is STILL loading after refresh, bypass it completely
        if (authLoading) {
          console.log('Auth still loading, bypassing auth system entirely');
          
          if (session?.user) {
            // Just use the session directly and create a profile
            console.log('Have session, creating profile directly', session.user.id);
            try {
              await supabase
                .from('profiles')
                .upsert({
                  id: session.user.id,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  username: session.user.email?.split('@')[0] || `user_${Date.now().toString().slice(-6)}`,
                  avatar_url: session.user.user_metadata?.avatar_url
                }, { onConflict: 'id' });
                
              // Don't wait for auth system, just set values directly
              setUsername(session.user.email?.split('@')[0] || '');
              
              if (session.user.user_metadata?.name) {
                setFullName(session.user.user_metadata.name);
              }
              
              setIsLoading(false);
              return;
            } catch (err) {
              console.error('Failed to create profile directly:', err);
            }
          } else {
            // No session, redirect to login
            router.replace('/login?error=no_session');
            return;
          }
        }
        
        // If no session after refresh, redirect to login
        if (!session || !session.user || !session.user.id) {
          console.log('No valid session in complete-profile, redirecting to login');
          router.replace('/login?error=auth_required');
          return;
        }
        
        // Force create a basic profile if needed to ensure we can proceed
        if (!user) {
          console.log('No user profile found, creating a basic profile');
          
          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                username: session.user.email?.split('@')[0] || `user_${Date.now().toString().slice(-6)}`,
                avatar_url: session.user.user_metadata?.avatar_url
              }, { onConflict: 'id' });
              
            if (insertError) {
              console.error('Failed to create profile:', insertError);
              setError('Failed to create your profile. Please try again or contact support.');
            } else {
              console.log('Basic profile created successfully');
            }
          } catch (err) {
            console.error('Error creating basic profile:', err);
          }
          
          // Continue without waiting for another refresh
          if (session.user.email) {
            setUsername(session.user.email.split('@')[0]);
          } else if (session.user.user_metadata?.name) {
            setUsername(session.user.user_metadata.name.replace(/\s/g, '').toLowerCase());
          }
          
          if (session.user.user_metadata?.name) {
            setFullName(session.user.user_metadata.name);
          }
          
          setIsLoading(false);
          return;
        }
        
        // Pre-fill data from existing user profile
        if (user) {
          if (user.username) setUsername(user.username);
          if (user.full_name) setFullName(user.full_name);
          
          // If profile already complete with username and full_name, redirect to dashboard
          if (user.username && user.username.trim() !== '' && 
              user.full_name && user.full_name.trim() !== '') {
            console.log('Profile already complete, redirecting to dashboard');
            router.replace('/dashboard');
            return;
          }
        }
        
        // Prefill username with email prefix or name from OAuth if not already set
        if (!username && session.user.email) {
          setUsername(session.user.email.split('@')[0]);
        } else if (!username && session.user.user_metadata?.name) {
          setUsername(session.user.user_metadata.name.replace(/\s/g, '').toLowerCase());
        }
        
        // Prefill full name with name from OAuth if not already set
        if (!fullName && session.user.user_metadata?.name) {
          setFullName(session.user.user_metadata.name);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error in auth check:', err);
        setError('Authentication check failed. Please try again.');
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [session, user, router, authLoading, supabase, refreshSession]);

  // Quick override to force show the form
  useEffect(() => {
    // Check for various query parameters that indicate we should show form directly
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const directForm = params.get('direct_form') === 'true';
      const redirect = params.has('redirect') || params.has('freshlogin') || params.has('initial');
      
      if (directForm || redirect) {
        console.log('Showing profile form directly due to query params:', 
          Object.fromEntries(params.entries()));
        setShowDirectForm(true);
        setIsLoading(false);
      }
    }
  }, []);

  // If direct form is requested, show it immediately
  if (showDirectForm && session) {
    return <ForceProfileForm session={session} router={router} supabase={supabase} />;
  }

  // Original handleSubmit function  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!session || !session.user || !session.user.id) {
        throw new Error('Not authenticated');
      }
      
      // Validate username
      if (!username || username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }
      
      // Validate full name
      if (!fullName || fullName.trim().length < 2) {
        throw new Error('Full name is required');
      }
      
      console.log('Using dedicated API route to update profile...');
      
      // Check if username is already taken (keep this check)
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', session.user.id)
        .single();
        
      if (existingUser) {
        throw new Error('Username is already taken');
      }
        
      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is what we want
        throw checkError;
      }
      
      // Use the API route instead of direct update
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          username,
          fullName
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        console.error('Profile update via API failed:', result.error);
        throw new Error(result.error || 'Failed to update profile');
      }
      
      console.log('Profile updated successfully via API, redirecting to dashboard');
      
      // Skip refresh session, force redirect
      const timestamp = Date.now();
      window.location.href = `/dashboard?profile_completed=true&t=${timestamp}`;
      
    } catch (error: any) {
      console.error('Profile submission error:', error);
      setError(error.message || 'An error occurred while updating your profile');
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (isLoading || authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your profile...</p>
          
          {showTryAgain && (
            <div className="mt-6">
              <p className="text-yellow-300 text-sm mb-3">Taking longer than expected?</p>
              <div className="flex flex-col space-y-4 items-center">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      // Add direct_form=true to force showing the form
                      const url = new URL(window.location.href);
                      url.searchParams.set('direct_form', 'true');
                      window.location.href = url.toString();
                    } else {
                      router.refresh();
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 w-full max-w-xs"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => {
                    // Navigate to emergency fix endpoint
                    window.location.href = '/api/emergency-fix-profile';
                  }}
                  className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition-colors duration-200 w-full max-w-xs"
                >
                  Fix Profile Issues (Emergency)
                </button>
                <button
                  onClick={async () => {
                    if (!session || !session.user) {
                      router.push('/login');
                      return;
                    }
                    
                    try {
                      // Force create a profile
                      const { error } = await supabase
                        .from('profiles')
                        .upsert({
                          id: session.user.id,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                        }, { onConflict: 'id' });
                        
                      if (error) {
                        console.error('Failed to create profile:', error);
                        alert('Profile creation failed. Please try again or contact support.');
                      } else {
                        // Force reload the page
                        if (typeof window !== 'undefined') {
                          window.location.reload();
                        } else {
                          router.refresh();
                        }
                      }
                    } catch (err) {
                      console.error('Error creating profile:', err);
                      alert('Profile creation failed. Please try again or contact support.');
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 w-full max-w-xs"
                >
                  Force Create Profile
                </button>
                <button
                  onClick={() => {
                    // Show the direct form instead of just setting values
                    setShowDirectForm(true);
                    setIsLoading(false);
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 w-full max-w-xs"
                >
                  Continue Manually
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 w-full max-w-xs"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
          
          {/* Debug info - only shows in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-gray-800/80 border border-gray-700 rounded-lg text-left max-w-md mx-auto">
              <h3 className="text-sm font-mono text-yellow-300 mb-2">Debug Info:</h3>
              <ul className="text-xs font-mono text-gray-300 space-y-1">
                <li>Auth Loading: {authLoading ? '✓' : '✗'}</li>
                <li>Component Loading: {isLoading ? '✓' : '✗'}</li>
                <li>Session: {session ? '✓' : '✗'}</li>
                <li>User ID: {session?.user?.id ? session.user.id.substring(0, 8) + '...' : 'none'}</li>
                <li>User Profile: {user ? '✓' : '✗'}</li>
                <li>Username: {user?.username || 'none'}</li>
                <li>Profile Attempts: {0}</li>
                <li>Pathname: {typeof window !== 'undefined' ? window.location.pathname : pathname}</li>
              </ul>
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    // Add direct_form=true to force showing the form
                    const url = new URL(window.location.href);
                    url.searchParams.set('direct_form', 'true');
                    window.location.href = url.toString();
                  } else {
                    router.refresh();
                  }
                }}
                className="mt-4 text-xs bg-blue-900/50 hover:bg-blue-900/80 text-blue-200 px-3 py-1 rounded-md"
              >
                Refresh Page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Safety check - don't render the form if not authenticated
  if (!session || !session.user) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="bg-red-900/50 border border-red-900 text-red-300 px-4 py-3 rounded-lg">
            Authentication required. Redirecting to login...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-gray-400 mt-2">
            Please provide your username and full name to continue
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-900 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-2">
              Full Name *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              minLength={2}
              className="appearance-none block w-full px-3 py-2 border-gray-700 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              minLength={3}
              className="appearance-none block w-full px-3 py-2 border-gray-700 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
            />
            <p className="text-xs text-gray-400 mt-1">
              Username must be at least 3 characters and can contain letters, numbers, and underscores.
            </p>
          </div>

          <button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Continue to Dashboard'}
          </button>
          
          {/* Skip button */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={async () => {
                try {
                  setIsSubmitting(true);
                  setError(null);
                  
                  // Call the force-complete API
                  const response = await fetch('/api/force-complete-profile');
                  const result = await response.json();
                  
                  if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Failed to skip profile completion');
                  }
                  
                  console.log('Profile completion skipped successfully');
                  
                  // Mark as complete in localStorage
                  if (typeof window !== 'undefined' && session?.user?.id) {
                    localStorage.setItem(`okto_profile_complete_${session.user.id}`, 'true');
                    localStorage.setItem('okto_profile_complete_global', 'true');
                  }
                  
                  // Redirect with a flag to indicate completion
                  window.location.href = `/dashboard?profile_completed=true&t=${Date.now()}`;
                } catch (error: any) {
                  console.error('Error skipping profile completion:', error);
                  setError(error.message || 'Failed to skip profile completion');
                  setIsSubmitting(false);
                }
              }}
              className="text-sm text-gray-400 hover:text-gray-300 underline"
              disabled={isSubmitting}
            >
              Skip for now (auto-generate profile)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}