'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Cog, 
  BarChart3, 
  Award, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  Menu,
  Shield,
  Clock,
  Home
} from 'lucide-react';
import { useSupabase } from '@/components/providers/SupabaseProvider';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { supabase } = useSupabase();
  const [collapsed, setCollapsed] = useState(false);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navItems = [
    { 
      label: 'Dashboard', 
      path: '/admin/dashboard', 
      icon: <LayoutDashboard size={20} className="text-blue-400" /> 
    },
    { 
      label: 'Proposals', 
      path: '/admin/proposals', 
      icon: <FileText size={20} className="text-green-400" /> 
    },
    { 
      label: 'Bounties', 
      path: '/admin/bounties', 
      icon: <Award size={20} className="text-purple-400" /> 
    },
    { 
      label: 'Projects', 
      path: '/admin/projects', 
      icon: <Cog size={20} className="text-pink-400" /> 
    },
    { 
      label: 'Users', 
      path: '/admin/users', 
      icon: <Users size={20} className="text-yellow-400" /> 
    },
    { 
      label: 'Submissions', 
      path: '/admin/submissions', 
      icon: <Clock size={20} className="text-orange-400" /> 
    },
    { 
      label: 'Analytics', 
      path: '/admin/analytics', 
      icon: <BarChart3 size={20} className="text-indigo-400" /> 
    },
    { 
      label: 'Settings', 
      path: '/admin/settings', 
      icon: <Settings size={20} className="text-gray-400" /> 
    },
  ];

  return (
    <div 
      className={`bg-gray-800/95 backdrop-blur-sm border-r border-gray-700/50 h-screen transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <span className="font-bold text-xl">okto</span>
              <span className="bg-gray-700/80 text-xs px-2 py-0.5 rounded ml-1">Admin</span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold">O</span>
              </div>
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white bg-gray-700/50 rounded-md p-1.5 transition-colors"
          >
            {collapsed ? (
              <Menu size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-2 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
              
              return (
                <li key={item.path} className="px-2">
                  <Link
                    href={item.path}
                    className="block"
                  >
                    <div
                      className={`w-full text-left px-3 py-3 rounded-xl flex items-center transition-all duration-200 ${
                        isActive
                          ? 'bg-gray-700/80 text-white shadow-md'
                          : 'text-gray-300 hover:bg-gray-700/40'
                      }`}
                    >
                      <span className={`flex-shrink-0 ${isActive ? 'animate-pulse' : ''}`}>
                        {item.icon}
                      </span>
                      
                      {!collapsed && (
                        <span className={`ml-3 ${isActive ? 'font-medium' : ''}`}>
                          {item.label}
                        </span>
                      )}
                      
                      {!collapsed && isActive && (
                        <div className="ml-auto w-1.5 h-6 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-full" />
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="mt-auto p-4 border-t border-gray-700/50">
          {!collapsed && (
            <div className="mb-4 bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Shield size={16} className="text-blue-400" />
                <h4 className="text-sm font-semibold text-gray-200">Admin Access</h4>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                You have full administrative privileges to manage the Okto Summer of Abstraction portal.
              </p>
            </div>
          )}
          
          {/* Back to Main Site button */}
          <Link
            href="/"
            className="flex items-center w-full px-3 py-3 mb-3 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md"
          >
            <Home size={18} className="text-white" />
            {!collapsed && <span className="ml-3 font-medium">Back to Main Site</span>}
          </Link>
          
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={18} className="text-red-400" />
            {!collapsed && <span className="ml-3">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
}