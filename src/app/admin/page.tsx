'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import dynamic from 'next/dynamic';
import { 
  Shield, 
  Award, 
  FileText, 
  BarChart3,
  Settings,
  Users,
  Clock,
  Rocket,
  User,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Layers
} from 'lucide-react';
import type { Database } from '@/types/database.types';

// Dynamically import admin components to avoid SSR issues
const AdminHeader = dynamic(() => import('@/components/admin/AdminHeader'), { 
  ssr: false 
});

export default function AdminLandingPage() {
  const [adminName, setAdminName] = useState('Admin');
  const [stats, setStats] = useState({
    proposals: 0,
    users: 0,
    bounties: 0
  });
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    const fetchAdminProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setAdminName(profile.full_name || profile.username || 'Admin');
        }
      }
    };
    
    const fetchStats = async () => {
      // Get counts from the database
      const { count: proposalCount } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true });
        
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Bounties might not exist in the database schema, so set a default value
      let bountyCount = 0;
      
      // Try to get the submissions count instead
      try {
        const { count: submissionCount } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true });
        
        bountyCount = submissionCount || 0;
      } catch (error) {
        console.error('Error fetching submissions count:', error);
      }
        
      setStats({
        proposals: proposalCount || 0,
        users: userCount || 0,
        bounties: bountyCount
      });
    };
    
    fetchAdminProfile();
    fetchStats();
  }, [supabase]);
  
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Render AdminHeader at the top */}
      <AdminHeader title="Admin Portal" />
      
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12 bg-gradient-to-r from-gray-800/80 to-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {adminName}</h1>
                <p className="text-gray-400 text-lg">
                  Okto Summer of Abstraction Program Administration
                </p>
              </div>
              <div className="bg-blue-600 rounded-2xl h-16 w-16 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield size={32} className="text-white" />
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-gray-800/70 rounded-xl p-4 border border-gray-700/50 flex items-center">
                <div className="p-3 rounded-lg bg-blue-500/20 mr-4">
                  <Users size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Users</p>
                  <p className="text-white text-2xl font-bold">{stats.users}</p>
                </div>
              </div>
              
              <div className="bg-gray-800/70 rounded-xl p-4 border border-gray-700/50 flex items-center">
                <div className="p-3 rounded-lg bg-purple-500/20 mr-4">
                  <FileText size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Proposals</p>
                  <p className="text-white text-2xl font-bold">{stats.proposals}</p>
                </div>
              </div>
              
              <div className="bg-gray-800/70 rounded-xl p-4 border border-gray-700/50 flex items-center">
                <div className="p-3 rounded-lg bg-green-500/20 mr-4">
                  <Award size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Active Submissions</p>
                  <p className="text-white text-2xl font-bold">{stats.bounties}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Admin Modules */}
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Layers size={20} className="mr-2 text-blue-400" />
            Administration Modules
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/dashboard">
              <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 backdrop-blur-sm hover:from-gray-800/90 hover:to-gray-800/70 group border border-gray-700/50 hover:border-blue-500/50 rounded-xl p-6 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-all duration-300">
                    <BarChart3 size={24} className="text-blue-400" />
                  </div>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-500/10 group-hover:bg-blue-500/20 transition-all">
                    <TrendingUp size={14} className="text-blue-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Dashboard</h2>
                <p className="text-gray-400 text-sm mb-4">View key statistics and program overview</p>
                <div className="flex text-xs space-x-2">
                  <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 font-medium">Analytics</span>
                  <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 font-medium">Stats</span>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/bounties">
              <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 backdrop-blur-sm hover:from-gray-800/90 hover:to-gray-800/70 group border border-gray-700/50 hover:border-purple-500/50 rounded-xl p-6 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-all duration-300">
                    <Award size={24} className="text-purple-400" />
                  </div>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-purple-500/10 group-hover:bg-purple-500/20 transition-all">
                    <CheckCircle size={14} className="text-purple-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Bounties</h2>
                <p className="text-gray-400 text-sm mb-4">Create and manage program bounties</p>
                <div className="flex text-xs space-x-2">
                  <span className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 font-medium">Create</span>
                  <span className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 font-medium">Review</span>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/proposals">
              <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 backdrop-blur-sm hover:from-gray-800/90 hover:to-gray-800/70 group border border-gray-700/50 hover:border-green-500/50 rounded-xl p-6 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-all duration-300">
                    <FileText size={24} className="text-green-400" />
                  </div>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-green-500/10 group-hover:bg-green-500/20 transition-all">
                    <AlertCircle size={14} className="text-green-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Proposals</h2>
                <p className="text-gray-400 text-sm mb-4">Review and process user proposals</p>
                <div className="flex text-xs space-x-2">
                  <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 font-medium">Approve</span>
                  <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 font-medium">Feedback</span>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/users">
              <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 backdrop-blur-sm hover:from-gray-800/90 hover:to-gray-800/70 group border border-gray-700/50 hover:border-yellow-500/50 rounded-xl p-6 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-all duration-300">
                    <Users size={24} className="text-yellow-400" />
                  </div>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-all">
                    <User size={14} className="text-yellow-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">Users</h2>
                <p className="text-gray-400 text-sm mb-4">Manage user accounts and permissions</p>
                <div className="flex text-xs space-x-2">
                  <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-medium">Roles</span>
                  <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-medium">Access</span>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/submissions">
              <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 backdrop-blur-sm hover:from-gray-800/90 hover:to-gray-800/70 group border border-gray-700/50 hover:border-orange-500/50 rounded-xl p-6 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-all duration-300">
                    <Clock size={24} className="text-orange-400" />
                  </div>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-orange-500/10 group-hover:bg-orange-500/20 transition-all">
                    <CheckCircle size={14} className="text-orange-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">Submissions</h2>
                <p className="text-gray-400 text-sm mb-4">Review and process user submissions</p>
                <div className="flex text-xs space-x-2">
                  <span className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 font-medium">Review</span>
                  <span className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 font-medium">Approve</span>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/settings">
              <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 backdrop-blur-sm hover:from-gray-800/90 hover:to-gray-800/70 group border border-gray-700/50 hover:border-gray-500/50 rounded-xl p-6 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gray-500/20 group-hover:bg-gray-500/30 transition-all duration-300">
                    <Settings size={24} className="text-gray-400" />
                  </div>
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-500/10 group-hover:bg-gray-500/20 transition-all">
                    <Rocket size={14} className="text-gray-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-gray-300 transition-colors">Settings</h2>
                <p className="text-gray-400 text-sm mb-4">Configure portal settings</p>
                <div className="flex text-xs space-x-2">
                  <span className="px-2 py-1 rounded-full bg-gray-500/10 text-gray-400 font-medium">Config</span>
                  <span className="px-2 py-1 rounded-full bg-gray-500/10 text-gray-400 font-medium">System</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}