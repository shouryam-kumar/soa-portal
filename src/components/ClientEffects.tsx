// src/components/ClientEffects.tsx
"use client";

import { useEffect } from 'react';
import { useSupabase } from './providers/SupabaseProvider';

export default function ClientEffects() {
  const { session, user, supabase } = useSupabase();

  // Force clean local storage on initial load
  useEffect(() => {
    const cleanupLocalStorage = () => {
      if (typeof window !== 'undefined') {
        // Determine if we need to clean based on URL params
        const params = new URLSearchParams(window.location.search);
        const hasLogoutParam = params.has('t') || params.has('logout');
        
        // If we're loading without a session or have a logout param, clean local storage
        if (hasLogoutParam || !session) {
          console.log('Cleaning localStorage auth data');
          
          // Find all supabase auth related items
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('supabase.auth.') || key.includes('-auth-token'))) {
              console.log('Removing localStorage item:', key);
              localStorage.removeItem(key);
            }
          }
          
          // Remove URL parameters to prevent repeated cleaning
          if (hasLogoutParam) {
            const url = new URL(window.location.href);
            url.searchParams.delete('t');
            url.searchParams.delete('logout');
            window.history.replaceState({}, document.title, url.toString());
          }
        }
      }
    };
    
    cleanupLocalStorage();
  }, [session]);

  // Force sign out if URL has specific params indicating logout was requested
  useEffect(() => {
    const handleForceSignOut = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has('force_logout') && session) {
        console.log('Force logout param detected, signing out');
        
        try {
          await supabase.auth.signOut();
          console.log('Forced sign out complete');
          
          // Remove the param and refresh the page
          const url = new URL(window.location.href);
          url.searchParams.delete('force_logout');
          window.location.href = url.toString();
        } catch (error) {
          console.error('Error during forced sign out:', error);
        }
      }
    };
    
    handleForceSignOut();
  }, [session, supabase]);

  // Debug authentication state
  useEffect(() => {
    console.log('ClientEffects auth state:', { 
      hasSession: Boolean(session), 
      hasUser: Boolean(user) 
    });
  }, [session, user]);

  // This component doesn't render anything visible
  return null;
}