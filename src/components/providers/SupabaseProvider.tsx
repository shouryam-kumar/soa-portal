// src/components/providers/SupabaseProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Session, createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/database.types';

// Define what a complete user profile should contain
interface UserProfile {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
  okto_points?: number | null;
  is_admin?: boolean | null;
  email?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  wallet_address?: string | null;
  bio?: string | null;
  full_name?: string | null;
  role?: string | null;
  skills?: string[] | null;
  [key: string]: any; // Allow other properties
}

type SupabaseContext = {
  supabase: ReturnType<typeof createClientComponentClient<Database>>;
  session: Session | null;
  user: UserProfile | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
  session: initialSession,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const [supabase] = useState(() => createClientComponentClient<Database>());
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionChecked = useRef(false);
  const sessionRefreshTimer = useRef<NodeJS.Timeout | null>(null);
  const profileFetchAttempts = useRef(0); // Track attempts to fetch profile
  const router = useRouter();

  // Force clear all auth data on mount if no valid session
  useEffect(() => {
    const forceCleanupAuth = () => {
      if (typeof window !== 'undefined') {
        // Clear Supabase auth tokens and related storage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('supabase.auth.') || key.includes('-auth-token'))) {
            console.log('Clearing localStorage key:', key);
            localStorage.removeItem(key);
          }
        }
      }
    };

    // If no server session was provided, we should clear client-side auth data
    if (!initialSession) {
      console.log('No initial session from server, clearing local auth data');
      forceCleanupAuth();
    }

    // Set a timeout to ensure we don't stay in loading state forever
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Auth loading timeout reached, forcing state to not loading');
        setIsLoading(false);
      }
    }, 2000); // 2 seconds max loading time

    return () => {
      clearTimeout(timeout);
      if (sessionRefreshTimer.current) {
        clearInterval(sessionRefreshTimer.current);
      }
    };
  }, [initialSession, isLoading]);

  // Create fallback user object if profile fetch fails
  const createBasicUserProfile = useCallback(() => {
    if (!session || !session.user) {
      return {
        id: 'unknown',
        email: '',
        username: 'Guest',
      };
    }
    
    const { user } = session;
    return {
      id: user.id,
      email: user.email || undefined,
      avatar_url: user.user_metadata?.avatar_url,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
    };
  }, [session]);

  // Create a user profile if it doesn't exist
  const createUserProfile = useCallback(async () => {
    if (!session || !session.user) {
      console.error('Cannot create profile: no active session');
      return null;
    }

    try {
      const userData = session.user;
      
      // Extract data from user metadata or use defaults
      const newProfile = {
        id: userData.id,
        username: userData.user_metadata?.username || userData.email?.split('@')[0] || 'User',
        avatar_url: userData.user_metadata?.avatar_url || null,
        okto_points: 0,
        is_admin: false,
        email: userData.email,
        created_at: new Date().toISOString(),
      };
      
      console.log('Creating new user profile:', newProfile);
      
      const { error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating profile:', error);
        setUser(newProfile); // Still use the data even if save failed
        return newProfile;
      } else {
        console.log('Profile created successfully');
        setUser(newProfile);
        
        // Refresh the page to update UI with the new profile
        setTimeout(() => {
          router.refresh();
        }, 1000);

        return newProfile;
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      
      // Fallback to basic user object
      const basicProfile = createBasicUserProfile();
      setUser(basicProfile);
      return basicProfile;
    }
  }, [supabase, router, session, createBasicUserProfile]);

  // More robust profile fetching
  const fetchUserProfile = useCallback(async () => {
    if (!session) {
      console.warn('Cannot fetch profile: missing session');
      setUser(null);
      return null;
    }
    
    // Limit retries
    if (profileFetchAttempts.current > 2) {
      console.warn('Too many profile fetch attempts, using basic info only');
      
      const basicUser = createBasicUserProfile();
      setUser(basicUser);
      return basicUser;
    }
    
    profileFetchAttempts.current++;
    
    try {
      console.log('Fetching profile for user:', session.user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // Create profile if it doesn't exist (common for new users)
        if (error.code === 'PGRST116') { // No rows returned
          console.log('No profile found, creating one');
          return await createUserProfile();
        }
        
        // Fallback to basic user data if available
        const basicUser = createBasicUserProfile();
        setUser(basicUser);
        return basicUser;
      }
      
      if (data) {
        console.log('Profile data loaded for:', data.username || session.user.id);
        
        // Merge profile data with user metadata from session if available
        if (session?.user?.user_metadata) {
          const mergedData = {
            ...data,
            avatar_url: data.avatar_url || session.user.user_metadata.avatar_url,
            username: data.username || session.user.user_metadata.username || session.user.email?.split('@')[0],
          };
          setUser(mergedData);
          return mergedData;
        } else {
          setUser(data);
          return data;
        }
      } else {
        console.log('No profile found for user', session.user.id);
        // Create profile if it doesn't exist
        return await createUserProfile();
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Fallback to basic user info
      const basicUser = createBasicUserProfile();
      setUser(basicUser);
      return basicUser;
    }
  }, [supabase, session, createBasicUserProfile, createUserProfile]);

  // Memoize the refreshSession function to avoid recreation on renders
  const refreshSession = useCallback(async () => {
    // If already loading, don't trigger another refresh
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        setSession(null);
        setUser(null);
        return;
      }
      
      if (currentSession) {
        console.log('Session refreshed:', currentSession.user.id);
        setSession(currentSession);
        
        // Create a minimal user object right away to prevent UI flashing
        const basicUser = createBasicUserProfile();
        setUser(prev => prev || basicUser);
        
        // Then fetch the full profile
        await fetchUserProfile();
      } else {
        console.log('No session found on refresh');
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error in refreshSession:', error);
      setSession(null);
      setUser(null);
    } finally {
      setIsLoading(false);
      profileFetchAttempts.current = 0; // Reset attempts counter on successful refresh
    }
  }, [supabase, isLoading, createBasicUserProfile, fetchUserProfile]);

  // Check auth state on mount and subscribe to changes
  useEffect(() => {
    // Get initial session
    const checkSession = async () => {
      if (sessionChecked.current) return;
      
      try {
        setIsLoading(true);
        // Get the client-side session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        console.log('Session check:', 
          currentSession ? `Authenticated as ${currentSession.user.email}` : 'Not authenticated',
          error ? `Error: ${error.message}` : ''
        );
        
        if (currentSession) {
          console.log('Session found, setting user state');
          setSession(currentSession);
          
          // Create a minimal user object right away to prevent UI flashing
          const basicUser = createBasicUserProfile();
          setUser(basicUser);
          
          // Then fetch the full profile
          await fetchUserProfile();
        } else {
          console.log('No session found, clearing user state');
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setSession(null);
        setUser(null);
      } finally {
        sessionChecked.current = true;
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Set up periodic session refresh every 5 minutes to ensure token stays fresh
    sessionRefreshTimer.current = setInterval(() => {
      if (session) {
        console.log('Performing periodic session refresh');
        refreshSession();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id || 'no user');
        
        if (event === 'SIGNED_IN' && newSession?.user?.id) {
          console.log('User signed in:', newSession.user.id);
          setIsLoading(true);
          setSession(newSession);
          
          // Create a minimal user object right away
          const basicUser = createBasicUserProfile();
          setUser(basicUser);
          
          // Then fetch the full profile
          await fetchUserProfile();
          router.refresh();
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          // Clear user and session state
          console.log('User signed out, clearing session state');
          setIsLoading(true);
          setSession(null);
          setUser(null);
          
          // Force clear localStorage
          if (typeof window !== 'undefined') {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.startsWith('supabase.auth.') || key.includes('-auth-token'))) {
                localStorage.removeItem(key);
              }
            }
          }
          
          // Refresh the page to ensure all client state is reset
          router.refresh();
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && newSession) {
          // Update session but don't refetch profile
          console.log('Token refreshed for session');
          setSession(newSession);
        } else if (event === 'USER_UPDATED' && newSession) {
          // Update both session and profile
          console.log('User updated, refreshing profile');
          setSession(newSession);
          if (newSession.user?.id) {
            await fetchUserProfile();
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (sessionRefreshTimer.current) {
        clearInterval(sessionRefreshTimer.current);
      }
    };
  }, [supabase, router, initialSession, fetchUserProfile, refreshSession, createBasicUserProfile]);

  return (
    <Context.Provider value={{ supabase, session, user, isLoading, refreshSession }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }
  return context;
};