// src/components/providers/SupabaseProvider.tsx
'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Session, createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { Database } from '@/types/database.types';
import { createBrowserClient } from '@/lib/supabase-helpers';

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
  const [supabase] = useState(() => createBrowserClient());
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const sessionChecked = useRef(false);
  const profileCheckedRef = useRef(false); // Use a ref to track profile check across renders
  const profileCheckInProgressRef = useRef(false); // Track if a check is currently in progress
  const lastProfileCheckTime = useRef(0); // Track the last time we checked the profile
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

  // Use a dedicated function to check profile via API with throttling
  const checkProfileViaApi = useCallback(async (force = false) => {
    // Skip if already checked and not forcing
    if (profileCheckedRef.current && !force) {
      return { authenticated: true, complete: isProfileComplete };
    }
    
    // Skip if check is in progress to prevent multiple simultaneous requests
    if (profileCheckInProgressRef.current) {
      return { authenticated: true, complete: isProfileComplete };
    }
    
    // Check if we're throttling requests (no more than once every 3 seconds unless forced)
    const now = Date.now();
    if (!force && (now - lastProfileCheckTime.current < 3000)) {
      return { authenticated: true, complete: isProfileComplete };
    }
    
    try {
      // Mark check as in progress
      profileCheckInProgressRef.current = true;
      lastProfileCheckTime.current = now;
      
      // Check if there's already a value in local storage first
      if (typeof window !== 'undefined' && session?.user?.id) {
        const localStorageComplete = localStorage.getItem(`okto_profile_complete_${session.user.id}`) === 'true';
        if (localStorageComplete) {
          // If local storage says complete, we can return that immediately and still check API in background
          setIsProfileComplete(true);
          profileCheckedRef.current = true;
        }
      }
      
      // This is the actual API request
      const response = await fetch('/api/check-profile', {
        // Add cache control headers
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'x-timestamp': Date.now().toString()
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        profileCheckedRef.current = true; // Mark as checked
        
        if (result.authenticated && result.complete) {
          setIsProfileComplete(true);
          
          // Update user data if profile was returned
          if (result.profile) {
            setUser(prev => ({
              ...prev,
              ...result.profile
            }));
          }
          
          // Cache the result
          if (typeof window !== 'undefined' && session?.user?.id) {
            localStorage.setItem(`okto_profile_complete_${session.user.id}`, 'true');
          }
        } else {
          setIsProfileComplete(false);
        }
        
        return result;
      }
      
      return { authenticated: false, complete: false };
    } catch (error) {
      console.error('Error checking profile via API:', error);
      return { authenticated: false, complete: false };
    } finally {
      // Always mark check as complete
      profileCheckInProgressRef.current = false;
    }
  }, [isProfileComplete, session]);

  // Simple throttled refresh function
  const refreshSession = useCallback(async () => {
    // If already loading, don't trigger another refresh
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      if (currentSession) {
        setSession(currentSession);
        
        // Only check profile if not already checked or it's been more than 5 minutes
        const now = Date.now();
        if (!profileCheckedRef.current || (now - lastProfileCheckTime.current > 300000)) {
          await checkProfileViaApi(true); // Force check
        }
      } else {
        setSession(null);
        setUser(null);
        setIsProfileComplete(false);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, isLoading, checkProfileViaApi]);

  // Main auth effect that runs once on component mount
  useEffect(() => {
    // Don't run again if already checked
    if (sessionChecked.current) return;
    
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        // Get the client-side session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setSession(null);
          setUser(null);
          setIsProfileComplete(false);
          return;
        }
        
        if (currentSession) {
          setSession(currentSession);
          
          // Create a minimal user object right away to prevent UI flashing
          const basicUser = createBasicUserProfile();
          setUser(basicUser);
          
          // Only check profile via API if not already checked
          // We intentionally avoid the await here to not block rendering
          checkProfileViaApi().then(result => {
            // If profile is incomplete, redirect if needed
            if (!result.complete) {
              // Check if we're on an exempt path
              const isExemptPath = EXEMPT_PATHS.some(path => 
                pathname === path || pathname?.startsWith(path + '/')
              );
              
              // Only redirect if not on an exempt path
              if (!isExemptPath && !isLoading) {
                // Debounce the redirect
                const timeout = setTimeout(() => {
                  router.push('/complete-profile?initial=true');
                }, 800);
                
                // Clean up timeout if component unmounts
                return () => clearTimeout(timeout);
              }
            }
          }).catch(err => {
            console.error('Error in profile check:', err);
          });
        } else {
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
    
    // Set up periodic session refresh with a longer interval
    sessionRefreshTimer.current = setInterval(() => {
      if (session) {
        refreshSession();
      }
    }, 10 * 60 * 1000); // 10 minutes
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (event === 'SIGNED_IN' && newSession?.user?.id) {
          setIsLoading(true);
          setSession(newSession);
          
          // Create a minimal user object right away
          const basicUser = createBasicUserProfile();
          setUser(basicUser);
          
          // Reset profile check for new sign in
          profileCheckedRef.current = false;
          
          // Check profile without blocking
          checkProfileViaApi(true).then(result => {
            if (!result.complete) {
              const isExemptPath = EXEMPT_PATHS.some(path => 
                pathname === path || pathname?.startsWith(path + '/')
              );
              
              if (!isExemptPath) {
                router.push('/complete-profile?freshlogin=true');
              }
            } else {
              router.refresh();
            }
            
            setIsLoading(false);
          });
        } else if (event === 'SIGNED_OUT') {
          // Handle sign out
          setSession(null);
          setUser(null);
          setIsProfileComplete(false);
          profileCheckedRef.current = false;
          
          // Clear local storage on sign out
          if (typeof window !== 'undefined') {
            for (let key in localStorage) {
              if (key.startsWith('okto_') || 
                  key.includes('-auth-token') ||
                  key.startsWith('sb-')) {
                localStorage.removeItem(key);
              }
            }
            
            // Also clear session storage
            sessionStorage.clear();
          }
          
          // Refresh the page to ensure all client state is reset
          router.refresh();
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && newSession) {
          // Update session but don't refetch profile
          setSession(newSession);
        } else if (event === 'USER_UPDATED' && newSession) {
          // Update session
          setSession(newSession);
          // Reset profile check state to force a new check after a delay
          setTimeout(() => {
            profileCheckedRef.current = false;
            checkProfileViaApi(true);
          }, 500);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (sessionRefreshTimer.current) {
        clearInterval(sessionRefreshTimer.current);
      }
    };
  }, [supabase, router, initialSession, refreshSession, createBasicUserProfile, checkProfileViaApi, pathname]);

  // Add an emergency safety timeout to prevent UI from being stuck in loading state
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('Emergency timeout reached, forcing UI to ready state');
        setIsLoading(false);
        
        // If we have a session but no user profile, create a basic one
        if (session && !user) {
          const basicUser = createBasicUserProfile();
          setUser(basicUser);
          
          // EMERGENCY: Always force profile to complete on timeout to prevent loops
          setIsProfileComplete(true);
          if (typeof window !== 'undefined' && session.user?.id) {
            localStorage.setItem(`okto_profile_complete_${session.user.id}`, 'true');
            localStorage.setItem('okto_profile_complete_global', 'true');
            sessionStorage.removeItem('profile_redirect_count');
          }
        }
      }
    }, 5000); // 5 seconds max loading time (reduced from 8)
    
    return () => clearTimeout(safetyTimeout);
  }, [isLoading, session, user, createBasicUserProfile]);

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