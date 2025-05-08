// src/components/providers/SupabaseProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Session, createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';
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
  isProfileComplete: boolean;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

// Paths that are accessible without a complete profile
const EXEMPT_PATHS = [
  '/login', 
  '/register', 
  '/complete-profile', 
  '/auth/callback',
  '/logout',
  '/reset-password',
  '/privacy-policy',
  '/terms-of-service'
];

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
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [profileCheckPerformed, setProfileCheckPerformed] = useState(false);
  const sessionChecked = useRef(false);
  const sessionRefreshTimer = useRef<NodeJS.Timeout | null>(null);
  const profileFetchAttempts = useRef(0); // Track attempts to fetch profile
  const router = useRouter();
  const pathname = usePathname();

  // Check if a profile is complete (has username and full name)
  const checkProfileComplete = useCallback((profile: UserProfile | null) => {
    if (!profile) return false;

    // More lenient check - either username OR full_name is sufficient (not both required)
    const hasUsername = !!(profile.username && profile.username.trim() !== '');
    const hasFullName = !!(profile.full_name && profile.full_name.trim() !== '');
    
    // Consider complete if EITHER field is populated - not both required
    const isComplete = hasUsername || hasFullName;
    
    console.log(`Profile check: ${isComplete ? 'COMPLETE' : 'INCOMPLETE'} - Username: "${profile?.username}", Full name: "${profile?.full_name}"`);
    
    return isComplete;
  }, []);

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
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating profile:', error);
        setUser(newProfile); // Still use the data even if save failed
        setIsProfileComplete(checkProfileComplete(newProfile));
        return newProfile;
      } else {
        console.log('Profile created successfully');
        setUser(data || newProfile);
        setIsProfileComplete(checkProfileComplete(data || newProfile));
        
        // Refresh the page to update UI with the new profile
        setTimeout(() => {
          router.refresh();
        }, 1000);

        return data || newProfile;
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      
      // Fallback to basic user object
      const basicProfile = createBasicUserProfile();
      setUser(basicProfile);
      setIsProfileComplete(false);
      return basicProfile;
    }
  }, [supabase, router, session, createBasicUserProfile, checkProfileComplete]);

  // More robust profile fetching
  const fetchUserProfile = useCallback(async () => {
    if (!session) {
      console.warn('Cannot fetch profile: missing session');
      setUser(null);
      setIsProfileComplete(false);
      setIsLoading(false);
      return null;
    }
    
    // First check if we have a local storage flag indicating profile completion
    if (typeof window !== 'undefined' && 
        localStorage.getItem(`okto_profile_complete_${session.user.id}`) === 'true') {
      console.log('Local storage indicates profile is complete, setting state accordingly');
      // We'll still fetch profile data, but we'll assume it's complete for faster UI
      setIsProfileComplete(true);
    }
    
    // Limit retries
    if (profileFetchAttempts.current > 2) {
      console.warn('Too many profile fetch attempts, using basic info and trying to create profile');
      
      try {
        // Try to create a profile as a recovery mechanism
        console.log('Recovery attempt: creating profile for', session.user.id);
        
        const newProfile = {
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || `user_${Date.now().toString().slice(-6)}`,
          avatar_url: session.user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Attempt to insert or update the profile
        await supabase
          .from('profiles')
          .upsert(newProfile, { onConflict: 'id' });
          
        // Use this profile regardless of DB operation success
        setUser(newProfile);
        setIsProfileComplete(false); // Still require profile completion
        setIsLoading(false);
        return newProfile;
      } catch (err) {
        // If creation fails, use basic profile as fallback
        console.error('Recovery profile creation failed:', err);
        const basicUser = createBasicUserProfile();
        setUser(basicUser);
        setIsProfileComplete(false);
        setIsLoading(false);
        return basicUser;
      }
    }
    
    profileFetchAttempts.current++;
    
    try {
      console.log('Fetching profile for user:', session.user.id);
      
      // Set a simpler timeout to prevent hanging forever
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => {
          console.warn('Profile fetch timed out');
          resolve(null);
        }, 5000);
      });
      
      // Run the fetch
      const fetchPromise = new Promise<any>(async (resolve) => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        resolve({ data, error });
      });
      
      // Race the fetch against the timeout
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      clearTimeout(timeoutId!);
      
      // If timeout won the race
      if (result === null) {
        const basicUser = createBasicUserProfile();
        setUser(basicUser);
        setIsProfileComplete(false);
        setIsLoading(false);
        return basicUser;
      }
      
      const { data, error } = result;

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
        setIsProfileComplete(false);
        setIsLoading(false);
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
          setIsProfileComplete(checkProfileComplete(mergedData));
          setIsLoading(false);
          return mergedData;
        } else {
          setUser(data);
          setIsProfileComplete(checkProfileComplete(data));
          setIsLoading(false);
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
      setIsProfileComplete(false);
      setIsLoading(false);
      return basicUser;
    }
  }, [supabase, session, createBasicUserProfile, createUserProfile, checkProfileComplete]);

  // Memoize the refreshSession function to avoid recreation on renders
  const refreshSession = useCallback(async () => {
    // If already loading, don't trigger another refresh
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // First, perform the regular session refresh
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        setSession(null);
        setUser(null);
        setIsProfileComplete(false);
        return;
      }
      
      if (currentSession) {
        console.log('Session refreshed:', currentSession.user.id);
        setSession(currentSession);
        
        // Create a minimal user object right away to prevent UI flashing
        const basicUser = createBasicUserProfile();
        setUser(prev => prev || basicUser);
        
        // Directly check the database profile
        console.log('Checking profile completion directly from database');
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username, full_name, id, created_at, updated_at, email')
            .eq('id', currentSession.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setIsProfileComplete(false);
          } else if (profile) {
            // Check if EITHER username OR full_name is present
            const hasUsername = !!(profile.username && profile.username.trim() !== '');
            const hasFullName = !!(profile.full_name && profile.full_name.trim() !== '');
            const isComplete = hasUsername || hasFullName;
            
            console.log(`Profile check from DB: ${isComplete ? 'COMPLETE' : 'INCOMPLETE'}, Username: "${profile.username}", Full name: "${profile.full_name}"`);
            
            setUser({
              id: profile.id,
              username: profile.username,
              full_name: profile.full_name,
              created_at: profile.created_at,
              updated_at: profile.updated_at,
              avatar_url: profile.avatar_url || currentSession.user.user_metadata?.avatar_url || null,
              email: profile.email || currentSession.user.email
            });
            
            setIsProfileComplete(isComplete);
            
            // Cache the result in localStorage for faster UI rendering
            if (isComplete && typeof window !== 'undefined') {
              localStorage.setItem(`okto_profile_complete_${currentSession.user.id}`, 'true');
            }
          } else {
            console.log('No profile found in database');
            setIsProfileComplete(false);
          }
        } catch (e) {
          console.error('Error checking profile in database:', e);
          setIsProfileComplete(false);
        }
      } else {
        console.log('No session found on refresh');
        setSession(null);
        setUser(null);
        setIsProfileComplete(false);
      }
    } catch (error) {
      console.error('Error in refreshSession:', error);
      setSession(null);
      setUser(null);
      setIsProfileComplete(false);
    } finally {
      setIsLoading(false);
      profileFetchAttempts.current = 0; // Reset attempts counter on successful refresh
    }
  }, [supabase, isLoading, createBasicUserProfile]);

  // Check auth state on mount and subscribe to changes
  useEffect(() => {
    // Force clear all auth data on mount if no valid session
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
          
          // Use secure API to check profile completion
          try {
            console.log('Checking profile completion via secure API on initial load');
            const response = await fetch('/api/check-profile');
            
            if (response.ok) {
              const result = await response.json();
              
              if (result.authenticated && result.complete) {
                console.log('Profile is complete according to secure check');
                setIsProfileComplete(true);
                
                // Update user data if profile was returned
                if (result.profile) {
                  setUser(prev => ({
                    ...prev,
                    ...result.profile
                  }));
                }
              } else {
                console.log('Profile is incomplete according to secure check');
                setIsProfileComplete(false);
                
                // If profile is incomplete and not on an exempt path, redirect
                const isExemptPath = EXEMPT_PATHS.some(path => 
                  pathname === path || pathname?.startsWith(path + '/')
                );
                
                if (!isExemptPath) {
                  console.log('Redirecting to profile completion on initial load');
                  router.replace('/complete-profile?initial=true');
                }
              }
            } else {
              // Fallback to regular profile fetch
              console.warn('Secure profile check failed on initial load');
              const userProfile = await fetchUserProfile();
              
              // Check if profile is complete 
              const isComplete = checkProfileComplete(userProfile);
              setIsProfileComplete(isComplete);
              
              // If profile is incomplete and not on an exempt path, redirect
              if (!isComplete) {
                const isExemptPath = EXEMPT_PATHS.some(path => 
                  pathname === path || pathname?.startsWith(path + '/')
                );
                
                if (!isExemptPath) {
                  console.log('Profile incomplete on initial load, redirecting to profile completion');
                  router.replace('/complete-profile?initial=true');
                }
              }
            }
          } catch (e) {
            console.error('Error using secure profile check on initial load:', e);
            
            // Fallback to regular profile fetch
            const userProfile = await fetchUserProfile();
            
            // Check if profile is complete 
            const isComplete = checkProfileComplete(userProfile);
            setIsProfileComplete(isComplete);
            
            // If profile is incomplete and not on an exempt path, redirect
            if (!isComplete) {
              const isExemptPath = EXEMPT_PATHS.some(path => 
                pathname === path || pathname?.startsWith(path + '/')
              );
              
              if (!isExemptPath) {
                console.log('Profile incomplete on initial load, redirecting to profile completion');
                router.replace('/complete-profile?initial=true');
              }
            }
          }
        } else {
          console.log('No session found, clearing user state');
          setSession(null);
          setUser(null);
          setIsProfileComplete(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setSession(null);
        setUser(null);
        setIsProfileComplete(false);
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
          
          // Use secure API to check profile completion
          try {
            console.log('Checking profile completion via secure API after sign in');
            const response = await fetch('/api/check-profile');
            
            if (response.ok) {
              const result = await response.json();
              
              if (result.authenticated && result.complete) {
                console.log('Profile is complete according to secure check');
                setIsProfileComplete(true);
                
                // Update user data if profile was returned
                if (result.profile) {
                  setUser(prev => ({
                    ...prev,
                    ...result.profile
                  }));
                }
                
                // Only refresh if profile is complete
                router.refresh();
              } else {
                console.log('Profile incomplete after sign in, redirecting to complete profile');
                setIsProfileComplete(false);
                
                const isExemptPath = EXEMPT_PATHS.some(path => 
                  pathname === path || pathname?.startsWith(path + '/')
                );
                
                if (!isExemptPath) {
                  router.replace('/complete-profile?freshlogin=true');
                }
              }
            } else {
              // Fallback to regular profile fetch
              console.warn('Secure profile check failed after sign in');
              const userProfile = await fetchUserProfile();
              
              // Check profile completion the regular way as fallback
              const isComplete = checkProfileComplete(userProfile);
              
              if (!isComplete) {
                const isExemptPath = EXEMPT_PATHS.some(path => 
                  pathname === path || pathname?.startsWith(path + '/')
                );
                
                if (!isExemptPath) {
                  router.replace('/complete-profile?freshlogin=true');
                }
              } else {
                router.refresh();
              }
            }
          } catch (e) {
            console.error('Error using secure profile check:', e);
            
            // Fallback to fetching profile directly
            const userProfile = await fetchUserProfile();
            
            // Standard redirect logic as fallback
            const isComplete = checkProfileComplete(userProfile);
            
            if (!isComplete) {
              const isExemptPath = EXEMPT_PATHS.some(path => 
                pathname === path || pathname?.startsWith(path + '/')
              );
              
              if (!isExemptPath) {
                router.replace('/complete-profile?freshlogin=true');
              }
            } else {
              router.refresh();
            }
          }
          
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          // Clear user and session state
          console.log('User signed out, clearing session state');
          setIsLoading(true);
          setSession(null);
          setUser(null);
          setIsProfileComplete(false);
          
          // Force clear localStorage
          if (typeof window !== 'undefined') {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (
                key.startsWith('supabase.auth.') || 
                key.includes('-auth-token') ||
                key.startsWith('okto_profile_complete_')
              )) {
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

  // Redirect to profile completion if needed
  useEffect(() => {
    // Skip this effect when not mounted or still loading
    if (typeof window === 'undefined' || isLoading) {
      return;
    }
    
    // Check for special parameters that indicate we should skip profile checks
    const urlParams = new URLSearchParams(window.location.search);
    
    // Skip on any of these conditions
    if (urlParams.has('signedout') || 
        urlParams.has('emergency_signout') || 
        urlParams.has('signout_error') ||
        urlParams.has('force_signout') ||
        urlParams.has('profile_completed')) {
      console.log('Special URL parameter detected, skipping profile redirect checks');
      return;
    }
    
    // Special handler for force_complete parameter
    if (urlParams.has('force_complete') && session?.user?.id) {
      console.log('Force complete parameter detected, setting profile as complete');
      setIsProfileComplete(true);
      localStorage.setItem(`okto_profile_complete_${session.user.id}`, 'true');
      localStorage.setItem('okto_profile_complete_global', 'true');
      refreshSession();
      return;
    }
    
    // Only run for authenticated users with incomplete profiles
    if (session && !isProfileComplete) {
      // Check if we're already on an exempt path
      const isExemptPath = EXEMPT_PATHS.some(path => 
        pathname === path || pathname?.startsWith(path + '/')
      );
      
      // Skip if we're already on an exempt path like the complete-profile page
      if (isExemptPath) {
        console.log('Already on exempt path, skipping profile redirect');
        return;
      }
      
      // Check if user has a profile completion override in localStorage
      const hasLocalCompletionFlag = typeof window !== 'undefined' && (
        localStorage.getItem(`okto_profile_complete_${session.user.id}`) === 'true' ||
        localStorage.getItem('okto_profile_complete_global') === 'true'
      );
      
      // If we have a local flag, trust it and skip redirect
      if (hasLocalCompletionFlag) {
        console.log('Found local storage completion flag, skipping redirect');
        setIsProfileComplete(true);
        refreshSession();
        return;
      }
      
      // At this point, we have:
      // 1. Authenticated user with incomplete profile
      // 2. Not on an exempt path
      // 3. No localStorage override
      
      // Check how many redirects we've done to prevent loops
      const redirectCount = parseInt(sessionStorage.getItem('profile_redirect_count') || '0', 10);
      
      if (redirectCount >= 2) {
        console.warn('Too many redirect attempts - forcing profile to complete to break loop');
        // Force set the profile to complete to break the loop as emergency fallback
        setIsProfileComplete(true);
        localStorage.setItem(`okto_profile_complete_${session.user.id}`, 'true');
        localStorage.setItem('okto_profile_complete_global', 'true');
        
        // Reset the counter
        sessionStorage.removeItem('profile_redirect_count');
        return;
      }
      
      // Increment the redirect counter
      sessionStorage.setItem('profile_redirect_count', (redirectCount + 1).toString());
      
      // Do the actual redirect
      console.log(`Profile incomplete (attempt ${redirectCount + 1}), redirecting to complete-profile`);
      router.replace(`/complete-profile?redirect=true&attempt=${redirectCount + 1}&from=${pathname}`);
    } else if (!session) {
      // Reset redirect count when signed out
      sessionStorage.removeItem('profile_redirect_count');
    }
  }, [isLoading, session, isProfileComplete, pathname, router, refreshSession]);
  
  // Update local storage when profile state changes
  useEffect(() => {
    if (session?.user?.id && isProfileComplete && typeof window !== 'undefined') {
      localStorage.setItem(`okto_profile_complete_${session.user.id}`, 'true');
      localStorage.setItem('okto_profile_complete_global', 'true'); // Backup global flag
    }
  }, [session, isProfileComplete]);

  // Add an additional safety timeout to prevent UI from being stuck in loading state
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('Global auth loading timeout reached, forcing not loading state');
        setIsLoading(false);
        
        // If we have a session but no user profile, create a basic one
        if (session && !user) {
          const basicUser = createBasicUserProfile();
          setUser(basicUser);
          
          // EMERGENCY FIX: Always force profile to complete on timeout
          setIsProfileComplete(true);
          if (typeof window !== 'undefined' && session.user?.id) {
            console.log('EMERGENCY FIX: Force marking profile as complete on timeout');
            localStorage.setItem(`okto_profile_complete_${session.user.id}`, 'true');
            localStorage.setItem('okto_profile_complete_global', 'true');
            sessionStorage.removeItem('profile_redirect_count');
          }
        }
      }
    }, 8000); // 8 seconds max loading time
    
    return () => clearTimeout(safetyTimeout);
  }, [isLoading, session, user, createBasicUserProfile]);

  // Check for special URL params that should immediately affect auth state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Handle forced sign-out parameters - immediately clear session
      if (urlParams.has('force_signout') || urlParams.has('emergency_signout')) {
        console.log('Forced sign-out detected in URL, clearing session state');
        setSession(null);
        setUser(null);
        setIsProfileComplete(false);
        setIsLoading(false);
        
        // Also clear any related data
        localStorage.clear();
        sessionStorage.clear();
        
        // Remove the parameter from URL to prevent reapplying on refresh
        if (window.history && window.history.replaceState) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('force_signout');
          newUrl.searchParams.delete('emergency_signout');
          window.history.replaceState({}, '', newUrl.toString());
        }
      }
    }
  }, [pathname]);

  return (
    <Context.Provider value={{ supabase, session, user, isLoading, refreshSession, isProfileComplete }}>
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