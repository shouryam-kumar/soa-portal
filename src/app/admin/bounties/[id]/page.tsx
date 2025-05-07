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
  FilterIcon
} from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
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

export default function AdminBountyDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [submissions, setSubmissions] = useState<BountySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const supabase = createClientComponentClient<Database>();
  
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
        .eq('id', params.id)
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
  }, [supabase, params.id]);
  
  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      setSubmissionsLoading(true);
      
      // Use a direct query instead of RPC
      try {
        let query = supabase
          .from('submissions')
          .select(`
            *,
            submitter:submitted_by(id, username, avatar_url)
          `)
          .eq('milestone_id', params.id);
          
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
          
        const { data, error } = await query.order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
          
        // Transform the data to match our expected format
        const transformedData = data.map(item => ({
          id: item.id,
          bounty_id: item.milestone_id, // Map milestone_id to bounty_id
          submitter_id: item.submitted_by, // Map submitted_by to submitter_id
          title: item.content.split('\n')[0] || 'Untitled Submission', // Use first line of content as title
          description: item.content, // Use full content as description
          submission_url: item.links?.[0] || null, // Use first link as submission_url
          submission_text: item.content, // Use content as submission_text
          status: item.approved === true ? 'approved' : item.approved === false ? 'rejected' : 'pending',
          feedback: item.feedback || null,
          points_awarded: null, // Points are not stored in submissions table
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          submitter: item.submitter
        })) as BountySubmission[];
          
        setSubmissions(transformedData);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
      }
      
      setSubmissionsLoading(false);
    };
    
    if (params.id) {
      fetchSubmissions();
    }
  }, [supabase, params.id, statusFilter]);
  
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
        return 'bg-green-900/50 text-green-300';
      case 'rejected':
        return 'bg-red-900/50 text-red-300';
      case 'submitted':
      case 'pending':
        return 'bg-yellow-900/50 text-yellow-300';
      case 'completed':
        return 'bg-indigo-900/50 text-indigo-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };
  
  // Calculate submission stats
  const totalSubmissions = submissions.length;
  const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
  const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected').length;
  
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Bounty Details" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-400">Loading bounty details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (!bounty) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Bounty Details" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold mb-2">Bounty Not Found</h2>
              <p className="text-gray-400 mb-6">The bounty you're looking for doesn't exist or has been removed.</p>
              <Link href="/admin/bounties">
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2">
                  Return to Bounties
                </button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Bounty Details" />
        
        <main className="flex-1 p-6">
          <div className="mb-6">
            <Link href="/admin/bounties" className="text-purple-400 hover:text-purple-300 flex items-center mb-4">
              <ArrowLeft size={16} className="mr-1" />
              Back to Bounties
            </Link>
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-purple-900/50 text-purple-300 px-2.5 py-1 rounded-full text-xs font-medium">
                    Bounty
                  </span>
                  
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(bounty.status)}`}>
                    {bounty.status ? bounty.status.charAt(0).toUpperCase() + bounty.status.slice(1) : 'Unknown'}
                  </span>
                  
                  {bounty.fields?.map((field: string, index: number) => (
                    <span key={index} className="bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full text-xs font-medium">
                      {field}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl font-bold mb-2">{bounty.title}</h1>
                <div className="text-gray-400 text-sm flex items-center">
                  <Calendar size={14} className="mr-1" />
                  Created on {formatDate(bounty.created_at)}
                  {bounty.deadline && (
                    <span className="ml-4 flex items-center">
                      <Clock size={14} className="mr-1" />
                      Due {formatDate(bounty.deadline)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/bounties/${bounty.id}/edit`}>
                  <button className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                    <FileEdit size={16} className="mr-2" />
                    Edit Bounty
                  </button>
                </Link>
                <Link href={`/bounties/${bounty.id}`} target="_blank">
                  <button className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                    <ExternalLink size={16} className="mr-2" />
                    View Public
                  </button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Description</h2>
                <div className="text-gray-300 space-y-4">
                  {bounty.description.split('\n\n').map((paragraph: string, index: number) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
              
              {/* Submissions */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold">Submissions</h2>
                    <p className="text-sm text-gray-400">Total: {totalSubmissions} submissions</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {/* Status Filter */}
                    <div className="relative">
                      <select
                        className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    
                    {/* Refresh Button */}
                    <button 
                      onClick={() => {
                        setSubmissionsLoading(true);
                        router.refresh();
                        setTimeout(() => setSubmissionsLoading(false), 500);
                      }}
                      className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Refresh"
                    >
                      <RefreshCw size={20} className={submissionsLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>
                
                {submissionsLoading ? (
                  <div className="text-center p-8">
                    <RefreshCw size={32} className="animate-spin mx-auto text-blue-500 mb-4" />
                    <p className="text-gray-400">Loading submissions...</p>
                  </div>
                ) : submissions.length > 0 ? (
                  <div className="divide-y divide-gray-700">
                    {submissions.map((submission) => (
                      <div key={submission.id} className="p-4 hover:bg-gray-750">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                            {submission.submitter?.avatar_url ? (
                              <img 
                                src={submission.submitter.avatar_url} 
                                alt={submission.submitter.username || 'User'} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User size={20} className="text-gray-500" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                              <div>
                                <Link href={`/admin/bounties/${bounty.id}/submissions/${submission.id}`}>
                                  <h3 className="font-medium hover:text-purple-400">{submission.title}</h3>
                                </Link>
                                <div className="flex items-center mt-1">
                                  <span className="text-sm text-gray-400">
                                    By {submission.submitter?.username || 'Unknown User'}
                                  </span>
                                  <span className="mx-2 text-gray-600">•</span>
                                  <span className="text-sm text-gray-400">
                                    {formatDate(submission.created_at)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mt-2 sm:mt-0 flex items-center">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  submission.status === 'approved' ? 'bg-green-900 text-green-300' :
                                  submission.status === 'rejected' ? 'bg-red-900 text-red-300' :
                                  'bg-yellow-900 text-yellow-300'
                                }`}>
                                  {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                </span>
                                
                                {submission.status === 'approved' && submission.points_awarded && (
                                  <span className="ml-2 bg-purple-900/30 text-purple-300 px-2.5 py-1 rounded-full text-xs font-medium">
                                    +{submission.points_awarded} pts
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                              {submission.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2">
                              <Link href={`/admin/bounties/${bounty.id}/submissions/${submission.id}`}>
                                <button className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-md">
                                  View Details
                                </button>
                              </Link>
                              
                              {submission.status === 'pending' && (
                                <>
                                  <Link href={`/admin/bounties/${bounty.id}/submissions/${submission.id}/approve`}>
                                    <button className="bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-md flex items-center">
                                      <Check size={12} className="mr-1" />
                                      Approve
                                    </button>
                                  </Link>
                                  
                                  <Link href={`/admin/bounties/${bounty.id}/submissions/${submission.id}/reject`}>
                                    <button className="bg-red-700 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-md flex items-center">
                                      <X size={12} className="mr-1" />
                                      Reject
                                    </button>
                                  </Link>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="bg-gray-750 rounded-full p-4 inline-flex mb-4">
                      <Users size={32} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-300 mb-2">No Submissions Yet</h3>
                    <p className="text-gray-400 mb-4">
                      There are no submissions for this bounty yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Bounty Info */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Bounty Info</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Created on</div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-gray-500" />
                      <span>{formatDate(bounty.created_at)}</span>
                    </div>
                  </div>
                  
                  {bounty.deadline && (
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Deadline</div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2 text-gray-500" />
                        <span>{formatDate(bounty.deadline)}</span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Total Points</div>
                    <div className="flex items-center">
                      <Award size={16} className="mr-2 text-gray-500" />
                      <span className="text-xl font-bold text-purple-400">{bounty.total_points.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {bounty.skills_required && bounty.skills_required.length > 0 && (
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Skills Required</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {bounty.skills_required.map((skill: string, index: number) => (
                          <span key={index} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Submission Stats */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Submission Stats</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Submissions</span>
                    <span className="font-medium">{totalSubmissions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center text-yellow-400">
                      <Clock size={14} className="mr-1.5" />
                      Pending
                    </span>
                    <span className="font-medium">{pendingSubmissions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center text-green-400">
                      <Check size={14} className="mr-1.5" />
                      Approved
                    </span>
                    <span className="font-medium">{approvedSubmissions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center text-red-400">
                      <X size={14} className="mr-1.5" />
                      Rejected
                    </span>
                    <span className="font-medium">{rejectedSubmissions}</span>
                  </div>
                </div>
                
                {/* Submission Progress Bar */}
                {totalSubmissions > 0 && (
                  <div className="mt-4">
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      {approvedSubmissions > 0 && (
                        <div 
                          className="h-full bg-green-500 float-left"
                          style={{ width: `${(approvedSubmissions / totalSubmissions) * 100}%` }}
                        ></div>
                      )}
                      {pendingSubmissions > 0 && (
                        <div 
                          className="h-full bg-yellow-500 float-left"
                          style={{ width: `${(pendingSubmissions / totalSubmissions) * 100}%` }}
                        ></div>
                      )}
                      {rejectedSubmissions > 0 && (
                        <div 
                          className="h-full bg-red-500 float-left"
                          style={{ width: `${(rejectedSubmissions / totalSubmissions) * 100}%` }}
                        ></div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Creator Info */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Creator</h2>
                
                <div className="flex items-center mb-4">
                  {bounty.profiles?.avatar_url ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                      <img 
                        src={bounty.profiles.avatar_url} 
                        alt={bounty.profiles.username || 'User'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-medium">
                        {bounty.profiles?.username?.substring(0, 2).toUpperCase() || 'OK'}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <div className="font-medium">{bounty.profiles?.username || 'Okto Team'}</div>
                  </div>
                </div>
                
                {bounty.profiles?.id && (
                  <Link href={`/admin/users/${bounty.profiles.id}`}>
                    <button className="w-full mt-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm flex items-center justify-center">
                      <User size={16} className="mr-2" />
                      View User Profile
                    </button>
                  </Link>
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
                
                <div className="space-y-3">
                  <Link href={`/admin/bounties/${bounty.id}/edit`}>
                    <button className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm flex items-center justify-center">
                      <FileEdit size={16} className="mr-2" />
                      Edit Bounty
                    </button>
                  </Link>
                  
                  <Link href={`/bounties/${bounty.id}`} target="_blank">
                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm flex items-center justify-center">
                      <ExternalLink size={16} className="mr-2" />
                      View Public Page
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}