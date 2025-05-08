'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  CheckCircle, 
  XCircle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  User,
  Calendar,
  MessageSquare,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import type { Database } from '@/types/database.types';

// Dynamically import AdminHeader
const AdminHeader = dynamic(() => import('@/components/admin/AdminHeader'), { 
  ssr: false 
});

// Define submission type
interface Submission {
  id: string;
  title: string;
  submitter: {
    id: string;
    name: string;
    avatar?: string;
  };
  project: {
    id: string;
    title: string;
  };
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback_count: number;
}

export default function AdminSubmissionsPage() {
  const supabase = createClientComponentClient<Database>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Submission | 'submitter.name' | 'project.title'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        
        // For demo purposes, use mock data
        const mockSubmissions: Submission[] = [
          {
            id: '1',
            title: 'ZeroPass Authentication Integration',
            submitter: {
              id: 'user1',
              name: 'Alex Johnson',
              avatar: '/images/avatars/alex.jpg'
            },
            project: {
              id: 'proj1',
              title: 'ZeroPass Implementation'
            },
            created_at: '2023-11-15T14:30:00Z',
            status: 'pending',
            feedback_count: 3
          },
          {
            id: '2',
            title: 'Minecraft Server Plugin',
            submitter: {
              id: 'user2',
              name: 'Sarah Miller',
              avatar: '/images/avatars/sarah.jpg'
            },
            project: {
              id: 'proj2',
              title: 'Minecraft SDK Integration'
            },
            created_at: '2023-11-10T09:15:00Z',
            status: 'approved',
            feedback_count: 5
          },
          {
            id: '3',
            title: 'Frontend UI Components',
            submitter: {
              id: 'user3',
              name: 'Michael Wong',
              avatar: '/images/avatars/michael.jpg'
            },
            project: {
              id: 'proj5',
              title: 'Cross-Chain Bridge Integration'
            },
            created_at: '2023-11-05T16:45:00Z',
            status: 'rejected',
            feedback_count: 2
          },
          {
            id: '4',
            title: 'Smart Contract Audit Report',
            submitter: {
              id: 'user4',
              name: 'Jamie Smith',
              avatar: '/images/avatars/jamie.jpg'
            },
            project: {
              id: 'proj3',
              title: 'Smart Contract Auditing Tool'
            },
            created_at: '2023-11-02T11:20:00Z',
            status: 'approved',
            feedback_count: 0
          },
          {
            id: '5',
            title: 'Wallet Integration Documentation',
            submitter: {
              id: 'user5',
              name: 'Diana Chen',
              avatar: '/images/avatars/diana.jpg'
            },
            project: {
              id: 'proj4',
              title: 'Account Abstraction Wallet'
            },
            created_at: '2023-10-28T08:30:00Z',
            status: 'pending',
            feedback_count: 1
          }
        ];
        
        setSubmissions(mockSubmissions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [supabase]);

  // Filter and sort submissions
  const filteredSubmissions = submissions
    .filter(submission => {
      // Apply search query filter
      const matchesSearch = 
        submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.submitter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.project.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply status filter
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortField === 'submitter.name') {
        return sortDirection === 'asc' 
          ? a.submitter.name.localeCompare(b.submitter.name) 
          : b.submitter.name.localeCompare(a.submitter.name);
      } else if (sortField === 'project.title') {
        return sortDirection === 'asc' 
          ? a.project.title.localeCompare(b.project.title) 
          : b.project.title.localeCompare(a.project.title);
      } else {
        const field = sortField as keyof Submission;
        if (a[field] < b[field]) return sortDirection === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
    });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Helper function to get status badge color
  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <>
      <AdminHeader title="Submissions" />
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h2 className="text-xl text-white mb-2">Review and manage project deliverables from contributors</h2>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 flex items-center">
            <Download size={16} className="mr-2" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search submissions..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <div className="w-full md:w-48">
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Submissions Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-750">
                <th className="px-6 py-3">
                  <button 
                    className="text-sm font-medium text-gray-300 flex items-center"
                    onClick={() => handleSort('title')}
                  >
                    Submission
                    {sortField === 'title' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={14} className="ml-1" /> : 
                        <ChevronDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    className="text-sm font-medium text-gray-300 flex items-center"
                    onClick={() => handleSort('submitter.name')}
                  >
                    Submitter
                    {sortField === 'submitter.name' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={14} className="ml-1" /> : 
                        <ChevronDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    className="text-sm font-medium text-gray-300 flex items-center"
                    onClick={() => handleSort('project.title')}
                  >
                    Project
                    {sortField === 'project.title' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={14} className="ml-1" /> : 
                        <ChevronDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    className="text-sm font-medium text-gray-300 flex items-center"
                    onClick={() => handleSort('created_at')}
                  >
                    Submitted
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={14} className="ml-1" /> : 
                        <ChevronDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    className="text-sm font-medium text-gray-300 flex items-center"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={14} className="ml-1" /> : 
                        <ChevronDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    className="text-sm font-medium text-gray-300 flex items-center"
                    onClick={() => handleSort('feedback_count')}
                  >
                    Feedback
                    {sortField === 'feedback_count' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={14} className="ml-1" /> : 
                        <ChevronDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                      <span>Loading submissions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No submissions found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <Link 
                        href={`/admin/submissions/${submission.id}`} 
                        className="font-medium text-white hover:text-blue-400 transition-colors flex items-start"
                      >
                        <FileText size={18} className="text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{submission.title}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <div className="flex items-center">
                        <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                          {submission.submitter.avatar ? (
                            <Image 
                              src={submission.submitter.avatar} 
                              alt={submission.submitter.name}
                              width={28}
                              height={28}
                              className="object-cover"
                            />
                          ) : (
                            <User size={14} className="text-white" />
                          )}
                        </div>
                        <span>{submission.submitter.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <Link 
                        href={`/admin/projects/${submission.project.id}`}
                        className="hover:text-blue-400 transition-colors"
                      >
                        {submission.project.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-blue-400 mr-2" />
                        <span className="text-gray-300">{formatDate(submission.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(submission.status)}`}>
                        {submission.status === 'pending' && 'Pending Review'}
                        {submission.status === 'approved' && 'Approved'}
                        {submission.status === 'rejected' && 'Rejected'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MessageSquare size={16} className="text-indigo-400 mr-2" />
                        <span className="text-gray-300">{submission.feedback_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/admin/submissions/${submission.id}`} 
                          className="p-1.5 bg-blue-600/20 rounded-md hover:bg-blue-600/30 transition-colors"
                          title="View details"
                        >
                          <Eye size={16} className="text-blue-400" />
                        </Link>
                        <button 
                          className="p-1.5 bg-green-600/20 rounded-md hover:bg-green-600/30 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={16} className="text-green-400" />
                        </button>
                        <button 
                          className="p-1.5 bg-red-600/20 rounded-md hover:bg-red-600/30 transition-colors"
                          title="Reject"
                        >
                          <XCircle size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Submissions Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Pending Review</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                {submissions.filter(s => s.status === 'pending').length}
              </h3>
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Approved</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                {submissions.filter(s => s.status === 'approved').length}
              </h3>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Rejected</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                {submissions.filter(s => s.status === 'rejected').length}
              </h3>
            </div>
            <div className="bg-red-500/20 p-3 rounded-lg">
              <XCircle className="text-red-500" size={24} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 