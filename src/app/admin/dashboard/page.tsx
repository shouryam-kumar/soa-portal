'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Award, 
  Settings, 
  LogOut,
  PlusCircle,
  Clock,
  Check,
  X
} from 'lucide-react';
import type { Database } from '@/types/database.types';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProposals: 0,
    totalBounties: 0,
    pendingSubmissions: 0
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Admin');
  
  const supabase = createClientComponentClient<Database>();
  
  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      try {
        // Get user profile data
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', user.id)
            .single();
            
          if (profile) {
            setUserName(profile.full_name || profile.username || 'Admin');
          }
        }
        
        // Get total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        // Get total proposals
        const { count: totalProposals } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'project');
        
        // Get total bounties
        const { count: totalBounties } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'bounty');
        
        // Get pending submissions
        const { count: pendingSubmissions } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        setStats({
          totalUsers: totalUsers || 0,
          totalProposals: totalProposals || 0,
          totalBounties: totalBounties || 0,
          pendingSubmissions: pendingSubmissions || 0
        });
        
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
      
      setLoading(false);
    };
    
    fetchStats();
  }, [supabase]);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-600 rounded-full h-10 w-10 flex items-center justify-center mr-3">
              <span className="font-bold">O</span>
            </div>
            <h1 className="text-xl font-bold">Okto Admin</h1>
          </div>
          
          <div className="flex items-center">
            <span className="mr-4">Welcome, {userName}</span>
            <button 
              onClick={handleSignOut}
              className="flex items-center text-gray-300 hover:text-white"
            >
              <LogOut size={18} className="mr-1" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-600/20 p-3 rounded-lg">
                <Users className="text-blue-500" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Users</p>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-600/20 p-3 rounded-lg">
                <FileText className="text-green-500" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Proposals</p>
                <h3 className="text-2xl font-bold">{stats.totalProposals}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-600/20 p-3 rounded-lg">
                <Award className="text-purple-500" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Bounties</p>
                <h3 className="text-2xl font-bold">{stats.totalBounties}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-yellow-600/20 p-3 rounded-lg">
                <Clock className="text-yellow-500" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Pending Submissions</p>
                <h3 className="text-2xl font-bold">{stats.pendingSubmissions}</h3>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/bounties/new">
              <div className="bg-gray-800 border border-gray-700 hover:border-purple-500 rounded-lg p-6 transition-colors cursor-pointer">
                <div className="flex items-center">
                  <div className="bg-purple-600/20 p-3 rounded-lg">
                    <PlusCircle className="text-purple-500" size={24} />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold">Create Bounty</h4>
                    <p className="text-sm text-gray-400">Add a new bounty to the platform</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/bounties">
              <div className="bg-gray-800 border border-gray-700 hover:border-purple-500 rounded-lg p-6 transition-colors cursor-pointer">
                <div className="flex items-center">
                  <div className="bg-purple-600/20 p-3 rounded-lg">
                    <Award className="text-purple-500" size={24} />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold">Manage Bounties</h4>
                    <p className="text-sm text-gray-400">View and manage all bounties</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/proposals">
              <div className="bg-gray-800 border border-gray-700 hover:border-green-500 rounded-lg p-6 transition-colors cursor-pointer">
                <div className="flex items-center">
                  <div className="bg-green-600/20 p-3 rounded-lg">
                    <FileText className="text-green-500" size={24} />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold">Review Proposals</h4>
                    <p className="text-sm text-gray-400">Check pending proposals</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Menu Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Manage Content</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/admin/bounties" className="flex items-center text-gray-300 hover:text-purple-400 py-2">
                  <Award size={18} className="mr-3" />
                  <span>Bounties</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/proposals" className="flex items-center text-gray-300 hover:text-purple-400 py-2">
                  <FileText size={18} className="mr-3" />
                  <span>Proposals</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/users" className="flex items-center text-gray-300 hover:text-purple-400 py-2">
                  <Users size={18} className="mr-3" />
                  <span>Users</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/analytics" className="flex items-center text-gray-300 hover:text-purple-400 py-2">
                  <BarChart3 size={18} className="mr-3" />
                  <span>Analytics</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/settings" className="flex items-center text-gray-300 hover:text-purple-400 py-2">
                  <Settings size={18} className="mr-3" />
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-yellow-600/20 p-2 rounded-full mr-3 mt-1">
                  <Clock size={16} className="text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium">New submission received</p>
                  <p className="text-sm text-gray-400">User ABC submitted work for Bounty XYZ</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-600/20 p-2 rounded-full mr-3 mt-1">
                  <Check size={16} className="text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Proposal approved</p>
                  <p className="text-sm text-gray-400">Project XYZ was approved by admin</p>
                  <p className="text-xs text-gray-500 mt-1">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-red-600/20 p-2 rounded-full mr-3 mt-1">
                  <X size={16} className="text-red-500" />
                </div>
                <div>
                  <p className="font-medium">Submission rejected</p>
                  <p className="text-sm text-gray-400">Submission for Bounty ABC was rejected</p>
                  <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                </div>
              </div>
              
              <Link href="/admin/activity" className="block text-center text-blue-400 hover:text-blue-300 text-sm mt-6">
                View all activity
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}