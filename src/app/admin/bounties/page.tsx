'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle,  
  FilterIcon, 
  RefreshCw,
  Calendar,
  ClipboardList,
  FileEdit,
  ExternalLink,
  Users,
  Award,
  Search,
  Filter,
  Plus,
  Check,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  DollarSign
} from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Database } from '@/types/database.types';
import Image from 'next/image';

// Dynamically import AdminHeader
const AdminHeader = dynamic(() => import('@/components/admin/AdminHeader'), { 
  ssr: false 
});

// Define types for bounty data
interface BountyWithProfile {
  id: string;
  title: string;
  description: string;
  short_description: string;
  status: string | null;
  total_points: number;
  created_at: string | null;
  updated_at: string | null;
  creator_id: string;
  review_feedback: string | null;
  fields: string[] | null;
  skills_required: string[] | null;
  submissions_count: number;
  profiles: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export default function AdminBountiesPage() {
  const router = useRouter();
  const [bounties, setBounties] = useState<BountyWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const supabase = createClientComponentClient<Database>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Fetch bounties with filters
  useEffect(() => {
    const fetchBounties = async () => {
      setLoading(true);
      
      try {
        // First get all bounties
        const { data: bountiesData, error: bountiesError } = await supabase
          .from('proposals')
          .select(`
            *,
            profiles:creator_id(id, username, avatar_url)
          `)
          .eq('type', 'bounty')
          .order('created_at', { ascending: false });

        if (bountiesError) {
          console.error('Error fetching bounties:', bountiesError);
          return;
        }

        if (bountiesData) {
          // Get submission counts for each bounty
          const bountiesWithCounts = await Promise.all(
            bountiesData.map(async (bounty) => {
              const { count, error: countError } = await supabase
                .from('submissions')
                .select('*', { count: 'exact', head: true })
                .eq('milestone_id', bounty.id);

              if (countError) {
                console.error(`Error counting submissions for bounty ${bounty.id}:`, countError);
              }

              return {
                ...bounty,
                submissions_count: count || 0,
                status: bounty.status || 'draft' // Provide a default status if null
              };
            })
          );

          setBounties(bountiesWithCounts);
        }
      } catch (error) {
        console.error('Error fetching bounties:', error);
        setBounties([]);
      }
      
      setLoading(false);
    };
    
    fetchBounties();
  }, [supabase]);
  
  // Fetch stats summary
  const [stats, setStats] = useState({
    totalBounties: 0,
    activeBounties: 0,
    pendingBounties: 0,
    completedBounties: 0,
    totalSubmissions: 0
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total bounties count
        const { count: totalBounties } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'bounty');
        
        // Get active (approved) bounties count
        const { count: activeBounties } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'bounty')
          .eq('status', 'approved');
        
        // Get pending review bounties count
        const { count: pendingBounties } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'bounty')
          .eq('status', 'submitted');
        
        // Get completed bounties count
        const { count: completedBounties } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'bounty')
          .eq('status', 'completed');
        
        // Get total submissions count
        const { count: totalSubmissions } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true });
        
        setStats({
          totalBounties: totalBounties || 0,
          activeBounties: activeBounties || 0,
          pendingBounties: pendingBounties || 0,
          completedBounties: completedBounties || 0,
          totalSubmissions: totalSubmissions || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
  }, [supabase]);
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // Filter bounties based on search and filter type
  const filteredBounties = bounties.filter(bounty => {
    const matchesSearch = 
      bounty.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bounty.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bounty.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bounty.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bounty.profiles?.avatar_url?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'active') return matchesSearch && bounty.status === 'approved';
    if (filterType === 'completed') return matchesSearch && bounty.status === 'completed';
    if (filterType === 'draft') return matchesSearch && bounty.status === 'submitted';
    if (filterType === 'cancelled') return matchesSearch && bounty.status === 'rejected';
    
    return matchesSearch;
  });

  // Sort bounties
  const sortedBounties = [...filteredBounties].sort((a, b) => {
    let valueA, valueB;
    
    if (sortBy === 'title') {
      valueA = a.title.toLowerCase();
      valueB = b.title.toLowerCase();
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    } 
    else if (sortBy === 'amount') {
      valueA = a.total_points;
      valueB = b.total_points;
      return sortDirection === 'asc' 
        ? valueA - valueB
        : valueB - valueA;
    }
    else if (sortBy === 'created_at') {
      valueA = new Date(a.created_at || '').getTime();
      valueB = new Date(b.created_at || '').getTime();
      return sortDirection === 'asc' 
        ? valueA - valueB
        : valueB - valueA;
    }
    else if (sortBy === 'deadline') {
      valueA = a.updated_at ? new Date(a.updated_at).getTime() : Number.MAX_SAFE_INTEGER;
      valueB = b.updated_at ? new Date(b.updated_at).getTime() : Number.MAX_SAFE_INTEGER;
      return sortDirection === 'asc' 
        ? valueA - valueB
        : valueB - valueA;
    }
    else if (sortBy === 'submissions') {
      valueA = a.submissions_count;
      valueB = b.submissions_count;
      return sortDirection === 'asc' 
        ? valueA - valueB
        : valueB - valueA;
    }
    
    return 0;
  });

  // Helper function for sortable headers
  const renderSortableHeader = (label: string, value: string) => {
    const isActive = sortBy === value;
    return (
      <button 
        className={`flex items-center ${isActive ? 'text-blue-400' : 'text-gray-400'}`}
        onClick={() => {
          if (isActive) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy(value);
            setSortDirection('desc');
          }
        }}
      >
        {label}
        {isActive && (
          sortDirection === 'asc' ? (
            <ChevronUp size={14} className="ml-1" />
          ) : (
            <ChevronDown size={14} className="ml-1" />
          )
        )}
      </button>
    );
  };

  // Helper function for status badge
  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check size={12} className="mr-1" /> Active
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Award size={12} className="mr-1" /> Completed
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X size={12} className="mr-1" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Manage Bounties" />
        
        <main className="flex-1 p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
              <div className="flex items-center">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <ClipboardList className="text-purple-500" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Total Bounties</p>
                  <h3 className="text-2xl font-bold">{stats.totalBounties}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
              <div className="flex items-center">
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <Award className="text-green-500" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Active Bounties</p>
                  <h3 className="text-2xl font-bold">{stats.activeBounties}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
              <div className="flex items-center">
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <Calendar className="text-yellow-500" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Pending Review</p>
                  <h3 className="text-2xl font-bold">{stats.pendingBounties}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
              <div className="flex items-center">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Users className="text-blue-500" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Total Submissions</p>
                  <h3 className="text-2xl font-bold">{stats.totalSubmissions}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
              <div className="flex items-center">
                <div className="bg-indigo-500/20 p-3 rounded-lg">
                  <Award className="text-indigo-500" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">Completed</p>
                  <h3 className="text-2xl font-bold">{stats.completedBounties}</h3>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bounties Table */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-8">
            <div className="p-4 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-bold">All Bounties</h2>
              
              <div className="flex flex-wrap gap-2">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search bounties..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-700 text-white placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Status Filter */}
                <div className="relative">
                  <select
                    className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="approved">Approved</option>
                    <option value="submitted">Submitted</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                  <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
                
                {/* Create Bounty */}
                <Link href="/admin/bounties/new">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 flex items-center text-sm">
                    <PlusCircle size={16} className="mr-2" />
                    Create Bounty
                  </button>
                </Link>
                
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
                <p className="text-gray-400">Loading bounties...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Points</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Created By</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Submissions</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {sortedBounties.length > 0 ? (
                      sortedBounties.map((bounty) => (
                        <tr key={bounty.id} className="hover:bg-gray-750">
                          <td className="py-3 px-4">
                            <Link href={`/admin/bounties/${bounty.id}`}>
                              <span className="font-medium hover:text-purple-400 cursor-pointer">{bounty.title}</span>
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-purple-400">{bounty.total_points}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {bounty.profiles?.avatar_url && (
                                <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden mr-2">
                                  <Image 
                                    src={bounty.profiles.avatar_url} 
                                    alt={bounty.profiles.username || "User"}
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <span>{bounty.profiles?.username || 'Okto Team'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-400">{formatDate(bounty.created_at)}</span>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(bounty.status)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-400">
                              {bounty.submissions_count || 0}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Link href={`/admin/bounties/${bounty.id}`}>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded">
                                  View
                                </button>
                              </Link>
                              <Link href={`/admin/bounties/${bounty.id}/edit`}>
                                <button className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded flex items-center">
                                  <FileEdit size={12} className="mr-1" />
                                  Edit
                                </button>
                              </Link>
                              <Link href={`/bounties/${bounty.id}`} target="_blank">
                                <button className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded flex items-center">
                                  <ExternalLink size={12} className="mr-1" />
                                  Public
                                </button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-400">
                          No bounties match the current filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}