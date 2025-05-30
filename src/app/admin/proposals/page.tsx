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
  AlertTriangle,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { Database } from '@/types/database.types';

// Dynamically import AdminHeader
const AdminHeader = dynamic(() => import('@/components/admin/AdminHeader'), { 
  ssr: false 
});

// Define proposal type
interface Proposal {
  id: string;
  title: string;
  created_at: string | null;
  updated_at: string | null;
  status: string | null;
  type: string;
  total_points: number;
  fields: string[] | null;
  profiles: {
    username: string | null;
    avatar_url: string | null;
    id: string;
  } | null;
}

// Define feedback modal props type
interface FeedbackModalProps {
  title: string;
  description: string;
  onConfirm: (feedback: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  confirmText: string;
  confirmColor: string;
}

export default function AdminProposalsPage() {
  const supabase = createClientComponentClient<Database>();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  // Error message timeout
  useEffect(() => {
    if (actionError || actionSuccess) {
      const timer = setTimeout(() => {
        setActionError(null);
        setActionSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionError, actionSuccess]);

  useEffect(() => {
    fetchProposals();
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsAdmin(false);
        return;
      }
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      setIsAdmin(userProfile?.role === 'admin');
    };
    checkAdmin();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          status,
          type,
          total_points,
          fields,
          profiles:creator_id(id, username, avatar_url)
        `)
        .neq('type', 'bounty')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching proposals:', error);
        setActionError('Failed to load proposals');
      } else if (data) {
        setProposals(data);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setActionError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  // Handle proposal approval
  const handleApprove = async (proposalId: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;
    
    setSelectedProposal(proposal);
    setFeedbackText('');
    setShowApproveModal(true);
  };

  // Handle proposal rejection
  const handleReject = async (proposalId: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;
    
    setSelectedProposal(proposal);
    setFeedbackText('');
    setShowRejectModal(true);
  };

  // Confirm approval
  const confirmApprove = async (feedback: string) => {
    if (!selectedProposal) return;
    
    setActionLoading(true);
    try {
      // Update proposal status
      const { error } = await supabase
        .from('proposals')
        .update({ 
          status: 'approved',
          review_feedback: feedback || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProposal.id);
      
      if (error) {
        throw error;
      }
      
      // Create project from proposal
      try {
        await supabase.rpc('create_project_from_proposal', {
          proposal_uuid: selectedProposal.id
        });
      } catch (projectError) {
        console.error('Error creating project:', projectError);
        // Continue even if project creation fails
      }
      
      // *** Add this step: Explicitly set proposal status to 'approved' again ***
      const { error: statusUpdateError } = await supabase
        .from('proposals')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', selectedProposal.id);

      if (statusUpdateError) {
        console.error('Error re-setting proposal status after project creation:', statusUpdateError);
        // Log the error but continue, as project creation might have succeeded
      }
      
      // Update local state
      setProposals(proposals.map(p => 
        p.id === selectedProposal.id ? { ...p, status: 'approved' } : p
      ));
      
      setActionSuccess(`Proposal "${selectedProposal.title}" has been approved`);
      setShowApproveModal(false);
    } catch (error) {
      console.error('Error approving proposal:', error);
      setActionError('Failed to approve proposal');
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm rejection
  const confirmReject = async (feedback: string) => {
    if (!selectedProposal || !feedback.trim()) return;
    
    setActionLoading(true);
    try {
      // Update proposal status
      const { error } = await supabase
        .from('proposals')
        .update({ 
          status: 'rejected',
          review_feedback: feedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProposal.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setProposals(proposals.map(p => 
        p.id === selectedProposal.id ? { ...p, status: 'rejected' } : p
      ));
      
      setActionSuccess(`Proposal "${selectedProposal.title}" has been rejected`);
      setShowRejectModal(false);
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      setActionError('Failed to reject proposal');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter proposals based on search and status
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.fields?.some(field => field.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || proposal.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort proposals
  const sortedProposals = [...filteredProposals].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'title') {
      return sortDirection === 'asc' 
        ? a.title.localeCompare(b.title) 
        : b.title.localeCompare(a.title);
    } else if (sortBy === 'points') {
      return sortDirection === 'asc' 
        ? a.total_points - b.total_points 
        : b.total_points - a.total_points;
    }
    return 0;
  });

  // Helper function for status badge
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-800/50">
            <CheckCircle size={12} className="mr-1" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-300 border border-red-800/50">
            <XCircle size={12} className="mr-1" /> Rejected
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-300 border border-yellow-800/50">
            <Clock size={12} className="mr-1" /> Submitted
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-800/50">
            <AlertCircle size={12} className="mr-1" /> Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
            <AlertTriangle size={12} className="mr-1" /> Unknown
          </span>
        );
    }
  };

  // Helper function for sorting headers
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

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Feedback Modal Component
  const FeedbackModal = ({ 
    title, 
    description, 
    onConfirm, 
    onCancel, 
    isLoading, 
    confirmText, 
    confirmColor 
  }: FeedbackModalProps) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>
        
        <div className="mb-4">
          <label htmlFor="feedback" className="block text-sm font-medium mb-2">
            Feedback
          </label>
          <textarea
            id="feedback"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your feedback for the submitter..."
            required={title.includes('Reject')}
          />
          {title.includes('Reject') && (
            <p className="mt-1 text-xs text-red-400">Feedback is required for rejections</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm"
          >
            Cancel
          </button>
          
          <button
            onClick={() => onConfirm(feedbackText)}
            disabled={isLoading || (title.includes('Reject') && !feedbackText.trim())}
            className={`bg-${confirmColor}-600 hover:bg-${confirmColor}-500 text-white rounded-lg px-4 py-2 text-sm flex items-center ${
              isLoading || (title.includes('Reject') && !feedbackText.trim()) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Checking admin access...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <div className="flex-1 overflow-x-hidden">
        <div className="container mx-auto px-6 py-8">
          <AdminHeader title="Proposals Management" />
          
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Proposals</h1>
                <p className="text-gray-400">Review and manage project and bounty proposals</p>
              </div>
              
              <div className="flex space-x-2">
                <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm flex items-center">
                  <Download size={14} className="mr-2" />
                  Export CSV
                </button>
              </div>
            </div>
            
            {/* Notifications */}
            {actionSuccess && (
              <div className="mb-4 p-3 bg-green-900/20 border border-green-800/30 rounded-lg text-green-300 flex items-center">
                <CheckCircle size={16} className="mr-2 text-green-400" />
                {actionSuccess}
              </div>
            )}
            
            {actionError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-800/30 rounded-lg text-red-300 flex items-center">
                <AlertCircle size={16} className="mr-2 text-red-400" />
                {actionError}
              </div>
            )}
            
            {/* Filters */}
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search proposals by title, submitter, or tag..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-700/50 text-white placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter size={16} className="text-gray-400" />
                  </div>
                  <select
                    className="block pl-10 pr-8 py-2 border border-gray-700 rounded-lg bg-gray-700/50 text-white"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Proposals Table */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl">
            {loading ? (
              <div className="py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-center text-gray-400 mt-4">Loading proposals...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700/70">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          {renderSortableHeader('Title', 'title')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Submitted By
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          {renderSortableHeader('Date', 'date')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          {renderSortableHeader('Points', 'points')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/70">
                      {sortedProposals.length > 0 ? (
                        sortedProposals.map((proposal) => (
                          <tr key={proposal.id} className="hover:bg-gray-750/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">{proposal.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {proposal.profiles?.avatar_url ? (
                                  <Image 
                                    src={proposal.profiles.avatar_url} 
                                    alt={proposal.profiles.username || 'User'} 
                                    width={24} 
                                    height={24} 
                                    className="rounded-full mr-2" 
                                  />
                                ) : (
                                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-2">
                                    <span className="text-white text-xs font-medium">
                                      {proposal.profiles?.username?.substring(0, 1).toUpperCase() || '?'}
                                    </span>
                                  </div>
                                )}
                                <div className="text-sm text-gray-300">{proposal.profiles?.username || 'Unknown'}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-300">{formatDate(proposal.created_at)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-300 capitalize">{proposal.type || 'Unknown'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-blue-300 font-medium">
                                {proposal.total_points.toLocaleString()} pts
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(proposal.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link 
                                href={`/admin/proposals/${proposal.id}`} 
                                className="text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-900/20 mr-1"
                              >
                                View
                              </Link>
                              {proposal.status === 'submitted' && (
                                <>
                                  <button 
                                    onClick={() => handleApprove(proposal.id)}
                                    className="text-green-400 hover:text-green-300 px-2 py-1 rounded hover:bg-green-900/20 mr-1"
                                    disabled={!isAdmin}
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleReject(proposal.id)}
                                    className="text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-900/20"
                                    disabled={!isAdmin}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                            {searchQuery || selectedStatus !== 'all' ? (
                              <>
                                <FileText size={40} className="mx-auto mb-2 text-gray-500" />
                                No proposals match your search criteria
                              </>
                            ) : (
                              <>
                                <FileText size={40} className="mx-auto mb-2 text-gray-500" />
                                No proposals have been submitted yet
                              </>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="bg-gray-800/50 px-6 py-3 flex items-center justify-between border-t border-gray-700/70">
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">
                        Showing <span className="font-medium">{sortedProposals.length}</span> of{' '}
                        <span className="font-medium">{proposals.length}</span> proposals
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Approve Modal */}
      {showApproveModal && selectedProposal && (
        <FeedbackModal
          title="Approve Proposal"
          description={`You are about to approve "${selectedProposal.title}". This will create a new project in the system and notify the submitter.`}
          onConfirm={confirmApprove}
          onCancel={() => setShowApproveModal(false)}
          isLoading={actionLoading}
          confirmText="Approve Proposal"
          confirmColor="green"
        />
      )}
      
      {/* Reject Modal */}
      {showRejectModal && selectedProposal && (
        <FeedbackModal
          title="Reject Proposal"
          description={`You are about to reject "${selectedProposal.title}". Please provide feedback explaining your decision to the submitter.`}
          onConfirm={confirmReject}
          onCancel={() => setShowRejectModal(false)}
          isLoading={actionLoading}
          confirmText="Reject Proposal"
          confirmColor="red"
        />
      )}
    </div>
  );
} 