'use client';

import { useState, useEffect, useRef } from 'react';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/navigation';

export default function UserAvatar() {
  const { supabase, user, session } = useSupabase();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Mark component as mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Add click outside listener to close dropdown
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.avatar-dropdown-container')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // If not mounted yet, show loading state
  if (!mounted) {
    return <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>;
  }

  // Render sign in buttons if not logged in
  if (!session) {
    return (
      <div className="flex space-x-2">
        <Link href="/login">
          <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-3 py-1.5 text-sm">
            Sign In
          </button>
        </Link>
        <Link href="/register">
          <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-1.5 text-sm">
            Sign Up
          </button>
        </Link>
      </div>
    );
  }
  
  // Handle sign out with local storage cleanup and state reset
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    
    // Nuclear approach to sign out - bypass normal flow entirely
    try {
      // Immediately nullify any session data
      if (typeof window !== 'undefined') {
        // Kill all localStorage
        localStorage.clear();
        
        // Kill all sessionStorage  
        sessionStorage.clear();
        
        // Forcefully disconnect from Supabase by clearing cookies
        document.cookie.split(";").forEach((c) => {
          const cookieName = c.split("=")[0].trim();
          if (cookieName.includes("sb-") || cookieName.includes("supabase") || 
              cookieName.includes("auth") || cookieName.includes("okto")) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
        });
        
        // Try to tell Supabase to sign out, but don't wait for it
        try {
          supabase.auth.signOut().catch(() => {});
        } catch (e) {
          // Ignore any errors, we'll force a reload anyway
        }
        
        // Force page reload to clear any in-memory state
        console.log("Nuclear sign-out completed, forcing page reload");
        
        // Wait a moment to let cookies clear
        setTimeout(() => {
          window.location.href = '/?force_signout=true';
        }, 100);
      }
    } catch (err) {
      // Even if there's an error, force reload
      console.error("Error during nuclear sign-out:", err);
      window.location.href = '/?emergency_signout=true';
    }
  };

  // Get initial for avatar
  const initial = user?.username?.charAt(0)?.toUpperCase() || 
                 session?.user?.email?.charAt(0)?.toUpperCase() || 'U';

  // Get display name
  const displayName = user?.username || 
                     (session?.user?.email ? session.user.email.split('@')[0] : 'User');
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative avatar-dropdown-container" ref={dropdownRef}>
      {/* Avatar button with dropdown indicator */}
      <button 
        className="flex items-center bg-gray-800 hover:bg-gray-700 rounded-lg px-2 py-1 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors"
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg mr-1">
          {initial}
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="py-2">
            <div className="px-4 py-3 border-b border-gray-700 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
              <p className="text-sm font-medium text-white">{displayName}</p>
              <p className="text-xs text-gray-400">OKTO Points: {user?.okto_points || 0}</p>
            </div>
            
            <div className="p-1">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User size={18} className="text-blue-400" />
                <span>Dashboard</span>
              </Link>
              
              <Link 
                href="/profile" 
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings size={18} className="text-green-400" />
                <span>Profile</span>
              </Link>
              
              {/* Client-side sign out button */}
              <button 
                className="flex w-full items-center gap-2 px-3 py-2 mt-1 text-sm text-red-300 hover:bg-red-900/30 hover:text-red-200 rounded-lg transition-colors border-t border-gray-700 pt-3"
                onClick={handleSignOut}
              >
                <LogOut size={18} className="text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
