'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Calendar, 
  Award, 
  ArrowLeft, 
  MessageCircle, 
  Check, 
  X, 
  Clock, 
  FileText,
  User,
  AlertCircle,
  FileEdit,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  Users,
  FilterIcon,
  ChevronDown
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import type { Database } from '@/types/database.types';

// Define types for submissions data
interface Submitter {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface BountySubmission {
  id: string;
  bounty_id: string;
  submitter_id: string;
  title: string;
  description: string;
  submission_url?: string | null;
  submission_text?: string | null;
  status: string;
  feedback?: string | null;
  points_awarded?: number | null;
  created_at: string;
  updated_at: string;
  submitter?: Submitter | null;
}

type Bounty = Database['public']['Tables']['proposals']['Row'] & {
  profiles: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
  deadline?: string | null;
};

interface AdminBountyDetailClientProps {
  id: string;
  submissions: BountySubmission[];
}

export default function AdminBountyDetailClient({ id, submissions: initialSubmissions }: AdminBountyDetailClientProps) {
  const router = useRouter();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [submissions, setSubmissions] = useState<BountySubmission[]>(initialSubmissions);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  const supabase = createClientComponentClient<Database>();
  
  // Set submissionsLoading to false when initialSubmissions are loaded
  useEffect(() => {
    setSubmissionsLoading(false);
  }, [initialSubmissions]);
  
  // Fetch bounty details
  useEffect(() => {
    const fetchBounty = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          profiles:creator_id(id, username, avatar_url)
        `)
        .eq('id', id)
        .eq('type', 'bounty')
        .single();
      
      if (error) {
        console.error('Error fetching bounty:', error);
      } else if (data) {
        setBounty(data);
      }
      
      setLoading(false);
    };
    
    fetchBounty();
  }, [supabase, id]);
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // Get status badge style
  const getStatusBadgeStyle = (status: string | null) => {
    switch (status) {
      case 'approved':
        return 'bg-green-900/50 text-green-300 border border-green-600/30';
      case 'rejected':
        return 'bg-red-900/50 text-red-300 border border-red-600/30';
      case 'submitted':
      case 'pending':
        return 'bg-yellow-900/50 text-yellow-300 border border-yellow-600/30';
      case 'completed':
        return 'bg-indigo-900/50 text-indigo-300 border border-indigo-600/30';
      default:
        return 'bg-gray-800 text-gray-300 border border-gray-600/30';
    }
  };
  
  // Calculate submission stats
  const totalSubmissions = submissions.length;
  const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
  const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected').length;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Bounty Details" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-gray-400">Loading bounty details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (!bounty) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Bounty Details" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 max-w-md text-center shadow-xl">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold mb-2">Bounty Not Found</h2>
              <p className="text-gray-400 mb-6">The bounty you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Link href="/admin/bounties">
                <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2.5 transition-all duration-200 shadow-lg shadow-purple-900/20 flex items-center justify-center space-x-2 w-full">
                  <ArrowLeft size={16} />
                  <span>Return to Bounties</span>
                </button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Bounty Details" />
        
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <Link href="/admin/bounties" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6 group transition-all duration-200">
              <div className="bg-purple-900/20 p-2 rounded-full mr-2 group-hover:bg-purple-900/30">
                <ArrowLeft size={16} />
              </div>
              <span>Back to Bounties</span>
            </Link>
            
            <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="bg-purple-900/70 text-purple-100 px-3 py-1.5 rounded-full text-xs font-semibold border border-purple-600/30 shadow-sm">
                      Bounty
                    </span>
                    
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusBadgeStyle(bounty.status)}`}>
                      {bounty.status ? bounty.status.charAt(0).toUpperCase() + bounty.status.slice(1) : 'Unknown'}
                    </span>
                    
                    {bounty.fields?.map((field: string, index: number) => (
                      <span key={index} className="bg-gray-700/70 text-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-600/30 shadow-sm">
                        {field}
                      </span>
                    ))}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-3 text-white">{bounty.title}</h1>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-gray-400 text-sm">
                    <div className="flex items-center bg-gray-900/50 rounded-lg py-1.5 px-3 border border-gray-700/30">
                      <Calendar size={14} className="mr-2 text-purple-400" />
                      <span>Created on {formatDate(bounty.created_at)}</span>
                    </div>
                    
                    {bounty.deadline && (
                      <div className="flex items-center bg-gray-900/50 rounded-lg py-1.5 px-3 border border-gray-700/30">
                        <Clock size={14} className="mr-2 text-purple-400" />
                        <span>Due {formatDate(bounty.deadline)}</span>
                      </div>
                    )}
                    
                    {bounty.profiles && (
                      <div className="flex items-center bg-gray-900/50 rounded-lg py-1.5 px-3 border border-gray-700/30">
                        <User size={14} className="mr-2 text-purple-400" />
                        <span>Created by {bounty.profiles.username || 'Anonymous'}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:self-start">
                  <Link href={`/admin/bounties/${bounty.id}/edit`}>
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 w-full sm:w-auto shadow-lg shadow-blue-900/20">
                      <FileEdit size={16} />
                      <span>Edit Bounty</span>
                    </button>
                  </Link>
                  <Link href={`/bounties/${bounty.id}`} target="_blank">
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 w-full sm:w-auto shadow-lg shadow-gray-900/20">
                      <ExternalLink size={16} />
                      <span>View Public</span>
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* Bounty Description */}
              <div className="bg-gray-900/50 rounded-xl p-4 md:p-6 mb-6 border border-gray-800/50">
                <h2 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
                  <FileText size={18} className="text-purple-400" />
                  Description
                </h2>
                <div className="prose prose-sm prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {bounty.description || 'No description provided.'}
                  </p>
                </div>
              </div>
              
              {/* Submission Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/40 shadow-md flex flex-col">
                  <span className="text-gray-400 text-sm mb-1">Total Submissions</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">{totalSubmissions}</span>
                    <div className="p-2 rounded-full bg-purple-900/30 text-purple-400">
                      <FileText size={20} />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/40 shadow-md flex flex-col">
                  <span className="text-gray-400 text-sm mb-1">Pending</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">{pendingSubmissions}</span>
                    <div className="p-2 rounded-full bg-yellow-900/30 text-yellow-400">
                      <Clock size={20} />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/40 shadow-md flex flex-col">
                  <span className="text-gray-400 text-sm mb-1">Approved</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">{approvedSubmissions}</span>
                    <div className="p-2 rounded-full bg-green-900/30 text-green-400">
                      <Check size={20} />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/40 shadow-md flex flex-col">
                  <span className="text-gray-400 text-sm mb-1">Rejected</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">{rejectedSubmissions}</span>
                    <div className="p-2 rounded-full bg-red-900/30 text-red-400">
                      <X size={20} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Submissions Section */}
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileText size={20} className="text-purple-400" />
                    Submissions
                  </h2>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Refresh Button */}
                    <button 
                      onClick={() => {
                        setSubmissions(initialSubmissions);
                        setSubmissionsLoading(true);
                      }}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 flex items-center justify-center border border-gray-700/50"
                      disabled={submissionsLoading}
                    >
                      <RefreshCw size={18} className={submissionsLoading ? "animate-spin text-gray-500" : "text-gray-300"} />
                    </button>
                    
                    {/* Filter Dropdown */}
                    <div className="relative w-full sm:w-auto">
                      <button 
                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                        className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 border border-gray-700/50 w-full"
                      >
                        <div className="flex items-center gap-2">
                          <FilterIcon size={16} className="text-gray-400" />
                          <span className="text-sm font-medium">
                            {statusFilter === 'all' ? 'All Submissions' : 
                             statusFilter === 'pending' ? 'Pending' : 
                             statusFilter === 'approved' ? 'Approved' : 
                             statusFilter === 'rejected' ? 'Rejected' : 'Filter'}
                          </span>
                        </div>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isFilterDropdownOpen && (
                        <div className="absolute z-10 mt-1 right-0 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700/50 py-1 animate-fadeIn">
                          <button 
                            onClick={() => {
                              setStatusFilter('all');
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-700 text-sm ${statusFilter === 'all' ? 'bg-purple-900/20 text-purple-300' : 'text-gray-300'}`}
                          >
                            All Submissions
                          </button>
                          <button 
                            onClick={() => {
                              setStatusFilter('pending');
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-700 text-sm ${statusFilter === 'pending' ? 'bg-purple-900/20 text-purple-300' : 'text-gray-300'}`}
                          >
                            Pending
                          </button>
                          <button 
                            onClick={() => {
                              setStatusFilter('approved');
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-700 text-sm ${statusFilter === 'approved' ? 'bg-purple-900/20 text-purple-300' : 'text-gray-300'}`}
                          >
                            Approved
                          </button>
                          <button 
                            onClick={() => {
                              setStatusFilter('rejected');
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-700 text-sm ${statusFilter === 'rejected' ? 'bg-purple-900/20 text-purple-300' : 'text-gray-300'}`}
                          >
                            Rejected
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {submissionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-2"></div>
                    <p className="text-gray-400 ml-3">Loading submissions...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center">
                    <div className="bg-gray-700/50 p-4 rounded-full inline-flex items-center justify-center mb-4">
                      <FileText size={24} className="text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Submissions Yet</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">There are no submissions for this bounty yet, or none that match your current filter.</p>
                    {statusFilter !== 'all' && (
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-5 py-2 transition-colors duration-200 inline-flex items-center"
                      >
                        <FilterIcon size={16} className="mr-2" />
                        Show All Submissions
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div 
                        key={submission.id} 
                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 md:p-5 hover:bg-gray-800/80 transition-colors duration-200 shadow-md"
                      >
                        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-3">
                          <div className="flex flex-col">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeStyle(submission.status)}`}>
                                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                              </span>
                              <span className="text-gray-400 text-xs">
                                Submitted {formatDate(submission.created_at)}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-white">{submission.title}</h3>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {submission.submitter && (
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 overflow-hidden mr-2 border border-gray-600/50">
                                  {submission.submitter.avatar_url ? (
                                    <Image
                                      src={submission.submitter.avatar_url}
                                      alt={submission.submitter.username || 'User'}
                                      width={32}
                                      height={32}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-purple-900/30">
                                      <User size={16} className="text-purple-300" />
                                    </div>
                                  )}
                                </div>
                                <span className="text-sm text-gray-300">
                                  {submission.submitter.username || 'Anonymous'}
                                </span>
                              </div>
                            )}
                            
                            <Link href={`/admin/bounties/${id}/submissions/${submission.id}`}>
                              <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg px-4 py-1.5 transition-colors duration-200 shadow-md shadow-purple-900/20">
                                Review
                              </button>
                            </Link>
                          </div>
                        </div>
                        
                        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800/50">
                          <p className="text-gray-300 text-sm line-clamp-2">
                            {submission.description}
                          </p>
                        </div>
                        
                        {submission.submission_url && (
                          <div className="mt-3 flex">
                            <a 
                              href={submission.submission_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 text-sm flex items-center transition-colors duration-200"
                            >
                              <ExternalLink size={14} className="mr-1" />
                              View Submission Link
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}