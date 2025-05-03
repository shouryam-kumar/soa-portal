// src/app/(auth)/complete-profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import type { Database } from '@/types/database.types';

export default function CompleteProfile() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session, user, isLoading: authLoading } = useSupabase();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  // Verify authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Wait for auth state to be determined
        if (authLoading) return;
        
        // If no session or user, redirect to login
        if (!session || !session.user || !session.user.id) {
          console.log('No valid session in complete-profile, redirecting to login');
          router.replace('/login?error=auth_required');
          return;
        }
        
        // Double-check session validity with a server call
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
          console.error('Error verifying user:', error?.message);
          router.replace('/login?error=invalid_session');
          return;
        }
        
        // If profile already complete with a username, redirect to dashboard
        if (user?.username) {
          console.log('Profile already complete, redirecting to dashboard');
          router.replace('/dashboard');
          return;
        }
        
        // Prefill username with email prefix or name from OAuth
        if (session.user.email) {
          setUsername(session.user.email.split('@')[0]);
        } else if (session.user.user_metadata?.name) {
          setUsername(session.user.user_metadata.name.replace(/\s/g, '').toLowerCase());
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error in auth check:', err);
        router.replace('/login?error=auth_check');
      }
    };
    
    checkAuth();
  }, [session, user, router, authLoading, supabase]);

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
      
      // Check if username is already taken
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
      
      // Update profile with username
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) {
        throw error;
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating your profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (isLoading || authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Safety check - don't render the form if not authenticated
  if (!session || !session.user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-gray-400 mt-2">
            Just a few more details to get you started
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-900 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
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