'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Users, 
  FileText, 
  Award, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import type { Database } from '@/types/database.types';
import dynamic from 'next/dynamic';

// Dynamically import AdminHeader
const AdminHeader = dynamic(() => import('@/components/admin/AdminHeader'), { 
  ssr: false 
});

// Define types for activity data
interface ActivityItem {
  id: number;
  type: 'proposal' | 'bounty' | 'submission' | 'user';
  action: string;
  user: string;
  title: string;
  time: string;
}

export default function AdminDashboardPage() {
  const supabase = createClientComponentClient<Database>();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProposals: 0,
    totalBounties: 0,
    totalSubmissions: 0,
    pendingApprovals: 0,
    activeProjects: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // This would normally fetch real data from Supabase
        // For now we'll use mock data
        setTimeout(() => {
          setStats({
            totalUsers: 128,
            totalProposals: 43,
            totalBounties: 21,
            totalSubmissions: 67,
            pendingApprovals: 12,
            activeProjects: 16
          });
          
          setRecentActivity([
            { id: 1, type: 'proposal', action: 'submitted', user: 'Alex Johnson', title: 'ZeroPass: Web3 Identity Solution', time: '10 minutes ago' },
            { id: 2, type: 'bounty', action: 'claimed', user: 'Sarah Miller', title: 'NFT Marketplace Integration', time: '1 hour ago' },
            { id: 3, type: 'submission', action: 'approved', user: 'Mark Wang', title: 'ERC-4337 Account Abstraction', time: '3 hours ago' },
            { id: 4, type: 'user', action: 'registered', user: 'Jamie Smith', title: '', time: '5 hours ago' },
            { id: 5, type: 'proposal', action: 'rejected', user: 'Taylor Evans', title: 'DeFi Lending Protocol', time: '1 day ago' }
          ]);
          
          setLoading(false);
        }, 800);
        
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  // Helper function to get icon based on activity type
  const getActivityIcon = (type: ActivityItem['type'], action: string) => {
    switch (type) {
      case 'proposal':
        return <FileText size={16} className={action === 'rejected' ? 'text-red-400' : 'text-blue-400'} />;
      case 'bounty':
        return <Award size={16} className="text-purple-400" />;
      case 'submission':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'user':
        return <Users size={16} className="text-yellow-400" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminHeader title="Admin Dashboard" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Overview of program metrics and activity</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <select 
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="month"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.totalUsers}</h3>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Users className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="flex items-center text-green-400">
                <ArrowUpRight size={14} className="mr-1" />
                <span>12%</span>
              </div>
              <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Total Proposals</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.totalProposals}</h3>
              </div>
              <div className="bg-indigo-500/20 p-3 rounded-lg">
                <FileText className="text-indigo-500" size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="flex items-center text-green-400">
                <ArrowUpRight size={14} className="mr-1" />
                <span>7%</span>
              </div>
              <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Active Bounties</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.totalBounties}</h3>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Award className="text-purple-500" size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="flex items-center text-red-400">
                <ArrowDownRight size={14} className="mr-1" />
                <span>3%</span>
              </div>
              <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Total Submissions</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.totalSubmissions}</h3>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <CheckCircle className="text-green-500" size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="flex items-center text-green-400">
                <ArrowUpRight size={14} className="mr-1" />
                <span>19%</span>
              </div>
              <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Pending Approvals</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.pendingApprovals}</h3>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <AlertTriangle className="text-yellow-500" size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="flex items-center text-red-400">
                <ArrowUpRight size={14} className="mr-1" />
                <span>5%</span>
              </div>
              <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Active Projects</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stats.activeProjects}</h3>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Clock className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="flex items-center text-green-400">
                <ArrowUpRight size={14} className="mr-1" />
                <span>8%</span>
              </div>
              <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          </div>
        </div>
        
        {/* Charts and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="font-medium text-white mb-4">Activity Overview</h3>
            <div className="aspect-video bg-gray-700/50 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Activity chart will be displayed here</p>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="font-medium text-white mb-4">Recent Activity</h3>
            
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="animate-pulse flex items-center">
                      <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
                      <div className="ml-3 flex-1">
                        <div className="h-2.5 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {getActivityIcon(activity.type, activity.action)}
                      </div>
                      <div>
                        <p className="text-sm text-white">
                          <span className="font-medium">{activity.user}</span>
                          {' '}
                          {activity.action}
                          {' '}
                          {activity.type === 'user' ? '' : `a ${activity.type}`}
                          {activity.title && `: "${activity.title}"`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button className="mt-6 w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white text-center transition-colors">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}