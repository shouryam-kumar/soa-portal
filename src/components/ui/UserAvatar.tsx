'use client';

import { useState, useEffect, useRef } from 'react';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSupabase } from '@/components/providers/SupabaseProvider';

export default function UserAvatar() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { supabase, user, session, isLoading } = useSupabase();

  // Set up click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/?t=' + Date.now();
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
    }
  };
  
  // Render fallback if not logged in
  if (!isLoading && !session) {
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
  
  // Generate initial for avatar
  const getInitial = () => {
    if (!user) return '?';
    if (user.username) return user.username.substring(0, 1).toUpperCase();
    if (user.email) return user.email.substring(0, 1).toUpperCase();
    if (session?.user?.email) return session.user.email.substring(0, 1).toUpperCase();
    return '?';
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {isLoading ? (
        // Loading state
        <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
      ) : (
        // Avatar button
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-transparent hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-all duration-200"
          aria-label="User menu"
        >
          {user?.avatar_url ? (
            <Image 
              src={user.avatar_url} 
              alt="User Avatar"
              width={40} 
              height={40} 
              className="rounded-full" 
            />
          ) : (
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {getInitial()}
            </div>
          )}
        </button>
      )}
      
      {/* Dropdown menu */}
      {isOpen && user && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-700">
              <p className="text-sm font-medium text-white">{user.username || user.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-gray-400">OKTO Points: {user.okto_points || 0}</p>
            </div>
            <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white" onClick={() => setIsOpen(false)}>
              <div className="flex items-center space-x-2">
                <User size={16} />
                <span>Dashboard</span>
              </div>
            </Link>
            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white" onClick={() => setIsOpen(false)}>
              <div className="flex items-center space-x-2">
                <User size={16} />
                <span>Profile</span>
              </div>
            </Link>
            <button 
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <div className="flex items-center space-x-2">
                <LogOut size={16} />
                <span>Sign Out</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
