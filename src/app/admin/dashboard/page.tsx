'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Award, 
  Calendar, 
  Filter, 
  RefreshCw,
  Check,
  X,
  Clock,
  FileEdit,
  ArrowRight
} from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import type { Database } from '@/types/database.types';

// Define types for proposal data
type ProposalWithProfile = Database['public']['Tables']['proposals']['Row'] & {
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  milestones_count: { count: number }[];
};

export default function AdminDashboard() {
  const router = useRouter();
  const [proposals, setProposals] = useState<ProposalWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const supabase = createClientComponentClient<Database>();
  
  // Fetch proposals with filters
  useEffect(() => {
    const fetchProposals = async () => {
      setLoading(true);
      
      let query = supabase
        .from('proposals')
        .select(`
          *,
          profiles:creator_id(username, avatar_url),
          milestones_count:milestones(count)
        `)
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching proposals:', error);
      } else {
        setProposals(data || []);
      }
      
      setLoading(false);
    };
    
    fetchProposals();
  }, [supabase, statusFilter, typeFilter]);
  
  // Fetch stats summary
  const [stats, setStats] = useState({
    totalProposals: 0,
    pendingReview: 0,
    approved: 0,
    rejected: 0,
    totalPoints: 0
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      // Get total proposals count
      const { count: totalProposals } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true });
      
      // Get pending review count
      const { count: pendingReview } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted');
      
      // Get approved count
      const { count: approved } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');
      
      // Get rejected count
      const { count: rejected } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');
      
      // Get total points allocated
      const { data: pointsData } = await supabase
        .from('proposals')
        .select('total_points')
        .eq('status', 'approved');
      
      const totalPoints = pointsData?.reduce((sum, proposal) => sum + (proposal.total_points || 0), 0) || 0;
      
      setStats({
        totalProposals: totalProposals || 0,
        pendingReview: pendingReview || 0,
        approved: approved || 0,
        rejected: rejected || 0,
        totalPoints
      });
    };
    
    fetchStats();
  }, [supabase]);
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Admin Dashboard" />
        
        <main className="flex-1 p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
              <div className="flex items-center">
                <div className="bg-indigo-500/20 p-3 rounded-lg">
                  <FileText className="text-indigo-500" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Total Proposals</p>
                  <h3 className="text-2xl font-bold">{stats.totalProposals}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
              <div className="flex items-center">
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <Clock className="text-yellow-500" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Pending Review</p>
                  <h3 className="text-2xl font-bold">{stats.pendingReview}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
              <div className="flex items-center">
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <Check className="text-green-500" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Approved</p>
                  <h3 className="text-2xl font-bold">{stats.approved}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
              <div className="flex items-center">
                <div className="bg-red-500/20 p-3 rounded-lg">
                  <X className="text-red-500" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Rejected</p>
                  <h3 className="text-2xl font-bold">{stats.rejected}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
              <div className="flex items-center">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Award className="text-blue-500" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Total OKTO Points</p>
                  <h3 className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>
          
          {/* Proposals Table */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-8">
            <div className="p-4 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-bold">All Proposals</h2>
              
              <div className="flex flex-wrap gap-2">
                {/* Status Filter */}
                <div className="relative">
                  <select
                    className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
                
                {/* Type Filter */}
                <div className="relative">
                  <select
                    className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="project">Project</option>
                    <option value="bounty">Bounty</option>
                  </select>
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
                
                {/* Refresh Button */}
                <button 
                  onClick={() => {
                    setLoading(true);
                    router.refresh();
                    setTimeout(() => setLoading(false), 500);
                  }}
                  className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Refresh"
                >
                  <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center p-8">
                <RefreshCw size={32} className="animate-spin mx-auto text-blue-500 mb-4" />
                <p className="text-gray-400">Loading proposals...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Created By</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {proposals.length > 0 ? (
                      proposals.map((proposal) => (
                        <tr key={proposal.id} className="hover:bg-gray-750">
                          <td className="py-3 px-4">
                            <Link href={`/proposals/${proposal.id}`}>
                              <span className="font-medium hover:text-blue-400 cursor-pointer">{proposal.title}</span>
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              proposal.type === 'project' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'
                            }`}>
                              {proposal.type.charAt(0).toUpperCase() + proposal.type.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {proposal.profiles?.avatar_url && (
                                <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden mr-2">
                                  <img 
                                    src={proposal.profiles.avatar_url} 
                                    alt={proposal.profiles.username || "User"}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <span>{proposal.profiles?.username || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-400">{formatDate(proposal.created_at)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              proposal.status === 'approved' ? 'bg-green-900 text-green-300' :
                              proposal.status === 'rejected' ? 'bg-red-900 text-red-300' :
                              proposal.status === 'submitted' ? 'bg-yellow-900 text-yellow-300' :
                              proposal.status === 'under_review' ? 'bg-orange-900 text-orange-300' :
                              proposal.status === 'completed' ? 'bg-blue-900 text-blue-300' :
                              'bg-gray-700 text-gray-300'
                            }`}>
                              {proposal.status ? proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) : 'Unknown'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Link href={`/proposals/${proposal.id}`}>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded">
                                  View
                                </button>
                              </Link>
                              {proposal.status === 'submitted' && (
                                <Link href={`/admin/proposals/${proposal.id}/review`}>
                                  <button className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded">
                                    Review
                                  </button>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400">
                          No proposals match the current filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Additional Admin Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Submissions */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recent Submissions</h2>
                <Link href="/admin/proposals?status=submitted" className="text-blue-400 hover:text-blue-300 flex items-center text-sm">
                  View All
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
              
              {proposals
                .filter(p => p.status === 'submitted')
                .slice(0, 5)
                .map((proposal) => (
                  <div key={proposal.id} className="mb-4 p-4 bg-gray-700 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <Link href={`/proposals/${proposal.id}`}>
                        <h3 className="font-medium hover:text-blue-400">{proposal.title}</h3>
                      </Link>
                      <span className="text-xs text-gray-400">{formatDate(proposal.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{proposal.short_description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {proposal.profiles?.avatar_url && (
                          <div className="w-5 h-5 rounded-full bg-gray-600 overflow-hidden mr-2">
                            <img 
                              src={proposal.profiles.avatar_url} 
                              alt={proposal.profiles.username || "User"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <span className="text-xs text-gray-400">{proposal.profiles?.username || 'Unknown'}</span>
                      </div>
                      <Link href={`/admin/proposals/${proposal.id}/review`}>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded">
                          Review
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
                
              {proposals.filter(p => p.status === 'submitted').length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  No pending submissions
                </div>
              )}
            </div>
            
            {/* Recently Approved */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recently Approved</h2>
                <Link href="/admin/proposals?status=approved" className="text-blue-400 hover:text-blue-300 flex items-center text-sm">
                  View All
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
              
              {proposals
                .filter(p => p.status === 'approved')
                .slice(0, 5)
                .map((proposal) => (
                  <div key={proposal.id} className="mb-4 p-4 bg-gray-700 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <Link href={`/proposals/${proposal.id}`}>
                        <h3 className="font-medium hover:text-blue-400">{proposal.title}</h3>
                      </Link>
                      <span className="text-xs text-gray-400">{formatDate(proposal.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{proposal.short_description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {proposal.profiles?.avatar_url && (
                          <div className="w-5 h-5 rounded-full bg-gray-600 overflow-hidden mr-2">
                            <img 
                              src={proposal.profiles.avatar_url} 
                              alt={proposal.profiles.username || "User"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <span className="text-xs text-gray-400">{proposal.profiles?.username || 'Unknown'}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {proposal.total_points ? `${proposal.total_points.toLocaleString()} points` : 'Points not set'}
                      </span>
                    </div>
                  </div>
                ))}
                
              {proposals.filter(p => p.status === 'approved').length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  No approved proposals yet
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}