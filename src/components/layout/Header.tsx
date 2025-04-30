'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, User, LogOut, Menu, X } from 'lucide-react';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const { supabase, user, session } = useSupabase();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <span className="font-bold text-xl">okto</span>
              <span className="bg-gray-700 text-xs px-2 py-1 rounded ml-2">Portal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
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
            <button className="text-gray-300 hover:text-white">
              <Bell size={20} />
            </button>
            
            {session ? (
              <div className="relative group">
                <button className="flex items-center space-x-2">
                  {user?.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.username || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg hidden group-hover:block z-10">
                  <div className="py-2">
                    {user && (
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm font-medium">{user.username || 'User'}</p>
                        <p className="text-xs text-gray-400">OKTO Points: {user.okto_points || 0}</p>
                      </div>
                    )}
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
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
              </div>
            ) : (
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
            )}
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}