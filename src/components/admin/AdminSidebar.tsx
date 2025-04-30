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
  ChevronDown, 
  ChevronRight 
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
      icon: <LayoutDashboard size={collapsed ? 24 : 20} /> 
    },
    { 
      label: 'Proposals', 
      path: '/admin/proposals', 
      icon: <FileText size={collapsed ? 24 : 20} /> 
    },
    { 
      label: 'Projects', 
      path: '/admin/projects', 
      icon: <Cog size={collapsed ? 24 : 20} /> 
    },
    { 
      label: 'Users', 
      path: '/admin/users', 
      icon: <Users size={collapsed ? 24 : 20} /> 
    },
    { 
      label: 'Analytics', 
      path: '/admin/analytics', 
      icon: <BarChart3 size={collapsed ? 24 : 20} /> 
    },
    { 
      label: 'Rewards', 
      path: '/admin/rewards', 
      icon: <Award size={collapsed ? 24 : 20} /> 
    },
    { 
      label: 'Settings', 
      path: '/admin/settings', 
      icon: <Settings size={collapsed ? 24 : 20} /> 
    },
  ];

  return (
    <div 
      className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
              <span className="font-bold text-xl">okto</span>
              <span className="bg-gray-700 text-xs px-2 py-0.5 rounded ml-1">Admin</span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">O</span>
              </div>
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white"
          >
            {collapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-2 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center py-2 px-3 rounded-lg ${
                    pathname === item.path || pathname?.startsWith(`${item.path}/`)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleSignOut}
            className={`flex items-center text-gray-300 hover:text-white w-full ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={collapsed ? 24 : 20} />
            {!collapsed && <span className="ml-3">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
}