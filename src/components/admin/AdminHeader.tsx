'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, Search, User } from 'lucide-react';
import { useSupabase } from '@/components/providers/SupabaseProvider';

interface AdminHeaderProps {
  title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const { user } = useSupabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Mock notifications for the UI
  const notifications = [
    {
      id: 1,
      title: 'New Proposal Submitted',
      message: 'ZeroPass: Cross-Chain KYC-Free Web3 Passport',
      time: '10 minutes ago',
      unread: true
    },
    {
      id: 2,
      title: 'Milestone Completed',
      message: 'Milestone 2 of Okto SDK Playground has been completed',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 3,
      title: 'New User Registered',
      message: 'John Smith has created an account',
      time: '1 day ago',
      unread: false
    }
  ];
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };
  
  return (
    <header className="bg-gray-800 border-b border-gray-700 py-4 mb-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:block relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </form>
          
          {/* Notifications */}
          <div className="relative">
            <button
              className="text-gray-300 hover:text-white relative"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
            >
              <Bell size={20} />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-700">
                  <h2 className="font-medium">Notifications</h2>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-700">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-3 hover:bg-gray-750 cursor-pointer ${
                            notification.unread ? 'bg-gray-750/50' : ''
                          }`}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <Bell size={14} className="text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{notification.title}</p>
                                {notification.unread && (
                                  <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-gray-400 text-xs mt-1">{notification.message}</p>
                              <p className="text-gray-500 text-xs mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      No notifications
                    </div>
                  )}
                </div>
                
                <div className="p-2 border-t border-gray-700">
                  <Link 
                    href="/admin/notifications"
                    className="block text-center text-sm text-blue-400 hover:text-blue-300 py-1"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* User Menu */}
          <div className="relative">
            <button
              className="flex items-center space-x-2"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                {user?.avatar_url ? (
                  <Image 
                    src={user.avatar_url} 
                    alt={user.username || 'Admin'} 
                    width={32} 
                    height={32} 
                    className="rounded-full" 
                  />
                ) : (
                  <User size={18} className="text-white" />
                )}
              </div>
              <span className="text-sm font-medium hidden md:block">
                {user?.username || 'Admin'}
              </span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-700">
                  <p className="font-medium text-sm">{user?.username || 'Admin'}</p>
                  <p className="text-gray-400 text-xs">Administrator</p>
                </div>
                
                <div className="p-2">
                  <Link 
                    href="/admin/profile"
                    className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                  >
                    Your Profile
                  </Link>
                  <Link 
                    href="/admin/settings"
                    className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                  >
                    Settings
                  </Link>
                  <hr className="my-1 border-gray-700" />
                  <button 
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 rounded-md"
                    onClick={async () => {
                      const { supabase } = useSupabase();
                      await supabase.auth.signOut();
                      window.location.href = '/login';
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}