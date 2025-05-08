// src/components/layout/Header.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Bell, Menu, X, LogOut } from 'lucide-react';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Import UserAvatar with no SSR to avoid hydration issues
const UserAvatar = dynamic(() => import('@/components/ui/UserAvatar'), {
  ssr: false,
  loading: () => (
    <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
  )
});

export default function Header() {
  const { session, isLoading, user, supabase } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [forceRerender, setForceRerender] = useState(0);
  
  // Check if current page is an admin page
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Use effect to mark when component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Check for sign-out parameter to force refresh on sign-out
  useEffect(() => {
    const signedOut = searchParams.get('signedout');
    if (signedOut && session) {
      // Force a reload if we still have a session but the URL indicates we signed out
      window.location.reload();
    }
  }, [searchParams, session]);
  
  // Force re-render when session changes
  useEffect(() => {
    setForceRerender(prev => prev + 1);
  }, [session]);
  
  // Don't render the header on admin pages - but only after all hooks have been called
  if (isAdminPage) {
    return null;
  }
  
  // Check if user is logged in
  const isAuthenticated = !!session;

  // Get username with fallbacks
  const getDisplayName = () => {
    if (user?.username) return user.username;
    if (user?.email) return user.email.split('@')[0];
    if (session?.user?.email) return session.user.email.split('@')[0];
    return '';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  // Handle client-side sign out with immediate UI update
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    
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
  
  // Render auth UI based on session state
  const renderAuthUI = () => {
    if (!mounted) return (
      <div className="w-20 h-8 bg-gray-700 animate-pulse rounded-lg"></div>
    );
    
    if (isAuthenticated) {
      return (
        <div className="flex items-center space-x-2">
          <UserAvatar />
          <span className="inline text-sm text-gray-300 ml-2">
            {getDisplayName()}
          </span>
        </div>
      );
    } else {
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
  };
  
  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/images/logo.svg" 
                  alt="Okto Logo" 
                  width={120} 
                  height={40} 
                  priority
                />
                <span className="bg-gray-700 text-xs px-2 py-1 rounded ml-2">Portal</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {isAuthenticated && (
                <Link href="/dashboard" className="text-gray-300 hover:text-white text-sm">
                  Dashboard
                </Link>
              )}
              <Link href="/proposals" className="text-gray-300 hover:text-white text-sm">
                Proposals
              </Link>
              <Link href="/bounties" className="text-gray-300 hover:text-white text-sm">
                Bounties
              </Link>
              <Link href="/projects" className="text-gray-300 hover:text-white text-sm">
                Projects
              </Link>
              <Link href="/ideaboard" className="text-gray-300 hover:text-white text-sm">
                Idea Board
              </Link>
            </div>

            {/* Search */}
            <div className="hidden md:block flex-1 max-w-xl px-6">
              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  placeholder="Search projects, bounties, or proposals" 
                  className="w-full bg-gray-700 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <button className="text-gray-300 hover:text-white">
                  <Bell size={20} />
                </button>
              )}

              {/* User info section - with conditional rendering */}
              {renderAuthUI()}
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-2">
              <div className="mb-4">
                <form onSubmit={handleSearch} className="relative">
                  <input 
                    type="text" 
                    placeholder="Search" 
                    className="w-full bg-gray-700 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>
              <nav className="space-y-1">
                {isAuthenticated && (
                  <Link 
                    href="/dashboard" 
                    className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <Link 
                  href="/proposals" 
                  className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Proposals
                </Link>
                <Link 
                  href="/bounties" 
                  className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Bounties
                </Link>
                <Link 
                  href="/projects" 
                  className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Projects
                </Link>
                <Link 
                  href="/ideaboard" 
                  className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Idea Board
                </Link>
                
                {isAuthenticated && (
                  <button 
                    className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center"
                    onClick={handleSignOut}
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
      {/* Add a spacer div to push content below the fixed header */}
      <div className="h-16"></div>
    </>
  );
}