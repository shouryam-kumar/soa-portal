'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  CheckCircle,
  User,
  AlertCircle,
  Send,
  FileEdit
} from 'lucide-react';
import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import type { Database } from '@/types/database.types';

// Define types
type Milestone = Database['public']['Tables']['milestones']['Row'];
type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  is_admin: boolean;
};

type Proposal = Database['public']['Tables']['proposals']['Row'] & {
  profiles: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    bio: string | null;
    wallet_address: string | null;
  } | null;
  milestones: Milestone[];
  comments?: Comment[];
};

// Use a more specific type for params
type PageParams = {
  params: {
    id: string
  }
};

export default function AdminProposalDetail({ params }: PageParams) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  
  // Safely access the id directly since we've properly typed it
  const proposalId = params.id;
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(action === 'approve');
  const [showRejectModal, setShowRejectModal] = useState(action === 'reject');
  const [showUnderReviewModal, setShowUnderReviewModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const supabase = createClientComponentClient<Database>();
  
  // Fetch proposal details
  useEffect(() => {
    const fetchProposal = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          profiles:creator_id(id, username, avatar_url, bio, wallet_address),
          milestones(*)
        `)
        .eq('id', proposalId)
        .single();
      
      if (error) {
        console.error('Error fetching proposal:', error);
      } else if (data) {
        setProposal(data);
        
        // Fetch comments (in a real app, these would come from a comments table)
        // This is a mock implementation
        const mockComments: Comment[] = [
          {
            id: '1',
            content: 'I like the overall concept, but could you provide more details about the implementation strategy?',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            user_id: 'admin1',
            user_name: 'Admin User',
            user_avatar: null,
            is_admin: true
          },
          {
            id: '2',
            content: 'Thanks for the feedback! I\'ve updated the proposal with more technical details in the implementation section.',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            user_id: data.creator_id,
            user_name: data.profiles?.username || 'User',
            user_avatar: data.profiles?.avatar_url || null,
            is_admin: false
          },
          {
            id: '3',
            content: 'The updates look good. I have one more question about the milestone deadlines - are they flexible?',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            user_id: 'admin1',
            user_name: 'Admin User',
            user_avatar: null,
            is_admin: true
          }
        ];
        
        setComments(mockComments);
      }
      
      setLoading(false);
    };
    
    fetchProposal();
  }, [supabase, proposalId]);
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // Handle status updates
  const updateStatus = async (newStatus: string) => {
    if (!proposal) return;
    
    setStatusLoading(true);
    
    const updateData: { status: string; review_feedback?: string } = { status: newStatus };
    
    if ((newStatus === 'rejected' || newStatus === 'approved') && feedback.trim()) {
      updateData.review_feedback = feedback;
    }
    
    const { error } = await supabase
      .from('proposals')
      .update(updateData)
      .eq('id', proposal.id);
    
    if (error) {
      console.error('Error updating proposal status:', error);
      alert('Failed to update proposal status. Please try again.');
    } else {
      // Create project if approved
      if (newStatus === 'approved') {
        try {
          await supabase.rpc('create_project_from_proposal', { 
            proposal_uuid: proposal.id 
          });
        } catch (error) {
          console.error('Error creating project:', error);
        }
      }
      
      // Reset UI state
      setShowApproveModal(false);
      setShowRejectModal(false);
      setShowUnderReviewModal(false);
      setFeedback('');
      
      // Refresh data
      router.refresh();
      
      // Add admin comment with feedback if provided
      if (feedback.trim()) {
        const actionText = newStatus === 'approved' ? 'approved' : 
                          newStatus === 'rejected' ? 'rejected' : 
                          'marked for review';
        
        const newAdminComment: Comment = {
          id: Date.now().toString(),
          content: `[Status Update] This proposal has been ${actionText}.\n\nFeedback: ${feedback}`,
          created_at: new Date().toISOString(),
          user_id: 'admin1',
          user_name: 'Admin User',
          user_avatar: null,
          is_admin: true
        };
        
        setComments(prev => [...prev, newAdminComment]);
      }
      
      // Update local state
      setProposal(prev => {
        if (!prev) return null;
        return { ...prev, status: newStatus };
      });
    }
    
    setStatusLoading(false);
  };
  
  // Handle comment submission
  const handleCommentSubmit = () => {
    if (!newComment.trim() || !proposal) return;
    
    setSubmittingComment(true);
    
    // In a real app, you would save the comment to your database
    // This is a mock implementation
    setTimeout(() => {
      const adminComment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        created_at: new Date().toISOString(),
        user_id: 'admin1',
        user_name: 'Admin User',
        user_avatar: null,
        is_admin: true
      };
      
      setComments(prev => [...prev, adminComment]);
      setNewComment('');
      setSubmittingComment(false);
    }, 500);
  };
  
  // Get status badge style
  const getStatusBadgeStyle = (status: string | null) => {
    switch (status) {
      case 'approved':
        return 'bg-green-900/50 text-green-300';
      case 'rejected':
        return 'bg-red-900/50 text-red-300';
      case 'submitted':
        return 'bg-yellow-900/50 text-yellow-300';
      case 'under_review':
        return 'bg-blue-900/50 text-blue-300';
      case 'completed':
        return 'bg-indigo-900/50 text-indigo-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };
  
  // Calculate milestone completion
  const totalMilestones = proposal?.milestones?.length || 0;
  const completedMilestones = proposal?.milestones?.filter(m => m.completed).length || 0;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Proposal Details" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-400">Loading proposal details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (!proposal) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Proposal Details" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold mb-2">Proposal Not Found</h2>
              <p className="text-gray-400 mb-6">The proposal you're looking for doesn't exist or has been removed.</p>
              <Link href="/admin/dashboard">
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2">
                  Return to Dashboard
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
        <AdminHeader title="Proposal Details" />
        
        <main className="flex-1 p-6">
          <div className="mb-6">
            <Link href="/admin/dashboard" className="text-blue-400 hover:text-blue-300 flex items-center mb-4">
              <ArrowLeft size={16} className="mr-1" />
              Back to Dashboard
            </Link>
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    proposal.type === 'project' 
                      ? 'bg-blue-900/50 text-blue-300' 
                      : 'bg-purple-900/50 text-purple-300'
                  }`}>
                    {proposal.type.charAt(0).toUpperCase() + proposal.type.slice(1)}
                  </span>
                  
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(proposal.status)}`}>
                    {proposal.status === 'under_review' ? 'Under Review' : 
                     proposal.status ? proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) : 'Unknown'}
                  </span>
                  
                  {proposal.fields?.map((field: string, index: number) => (
                    <span key={index} className="bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full text-xs font-medium">
                      {field}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl font-bold mb-2">{proposal.title}</h1>
                <div className="text-gray-400 text-sm flex items-center">
                  <Calendar size={14} className="mr-1" />
                  Submitted on {formatDate(proposal.created_at)}
                </div>
              </div>
              
              {/* Action Buttons */}
              {proposal.status === 'submitted' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowUnderReviewModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                  >
                    <Clock size={16} className="mr-2" />
                    Mark as Under Review
                  </button>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                  >
                    <Check size={16} className="mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                  >
                    <X size={16} className="mr-2" />
                    Reject
                  </button>
                </div>
              )}
              
              {proposal.status === 'under_review' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                  >
                    <Check size={16} className="mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                  >
                    <X size={16} className="mr-2" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Description</h2>
                <div className="text-gray-300 space-y-4">
                  {proposal.description.split('\n\n').map((paragraph: string, index: number) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
              
              {/* Milestones */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Milestones</h2>
                  <div className="text-sm text-gray-400">
                    {completedMilestones} of {totalMilestones} completed
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                
                {proposal.milestones && proposal.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {proposal.milestones.map((milestone: Milestone, index: number) => (
                      <div 
                        key={milestone.id} 
                        className={`border ${milestone.completed ? 'border-green-600' : 'border-gray-700'} rounded-lg p-4`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                              milestone.completed ? 'bg-green-500' : 'bg-gray-700'
                            }`}>
                              {milestone.completed ? (
                                <CheckCircle size={16} className="text-gray-900" />
                              ) : (
                                <span className="text-white text-xs font-medium">{index + 1}</span>
                              )}
                            </div>
                            <h3 className="font-medium">{milestone.title}</h3>
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <Calendar size={14} className="mr-1" />
                            <span>Due: {formatDate(milestone.deadline)}</span>
                          </div>
                        </div>
                        
                        <div className="ml-9 mt-2">
                          <p className="text-gray-300 text-sm mb-3">{milestone.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center text-gray-400 text-sm">
                              <Award size={14} className="mr-1" />
                              <span>{milestone.points_allocated} OKTO POINTS</span>
                            </div>
                            
                            {milestone.completed && milestone.completed_at && (
                              <div className="flex items-center text-green-400 text-sm">
                                <CheckCircle size={14} className="mr-1" />
                                <span>Completed on {formatDate(milestone.completed_at)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    No milestones defined for this proposal
                  </div>
                )}
              </div>
              
              {/* Comments Section */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Discussion ({comments.length})</h2>
                
                <div className="space-y-4 mb-6">
                  {comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className={`p-4 rounded-lg ${
                        comment.is_admin ? 'bg-blue-900/20 border border-blue-900/50' : 'bg-gray-750 border border-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          comment.is_admin ? 'bg-blue-600' : 'bg-purple-600'
                        }`}>
                          {comment.user_avatar ? (
                            <Image 
                              src={comment.user_avatar} 
                              alt={comment.user_name} 
                              width={40} 
                              height={40} 
                              className="rounded-full" 
                            />
                          ) : (
                            <span className="text-white font-medium">
                              {comment.user_name.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium flex items-center">
                                {comment.user_name}
                                {comment.is_admin && (
                                  <span className="ml-2 bg-blue-900/50 text-blue-300 text-xs px-2 py-0.5 rounded-full">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {formatDate(comment.created_at)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-gray-300 whitespace-pre-line">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Comment Form */}
                <div className="bg-gray-750 border border-gray-700 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-3">Add Comment</h3>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comment here..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                  ></textarea>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim() || submittingComment}
                      className={`flex items-center bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 transition-colors ${
                        (!newComment.trim() || submittingComment) ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {submittingComment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="mr-2" />
                          Post Comment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Review Feedback (if rejected or approved) */}
              {(proposal.status === 'rejected' || proposal.status === 'approved') && proposal.review_feedback && (
                <div className={`bg-${proposal.status === 'rejected' ? 'red' : 'green'}-900/30 border border-${proposal.status === 'rejected' ? 'red' : 'green'}-900 rounded-lg p-6`}>
                  <h2 className="text-lg font-bold mb-3 flex items-center">
                    <MessageCircle size={18} className="mr-2" />
                    {proposal.status === 'rejected' ? 'Rejection' : 'Approval'} Feedback
                  </h2>
                  <p className="text-gray-300 whitespace-pre-line">{proposal.review_feedback}</p>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Proposal Info */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Proposal Info</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Submitted on</div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-gray-500" />
                      <span>{formatDate(proposal.created_at)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Total Points</div>
                    <div className="flex items-center">
                      <Award size={16} className="mr-2 text-gray-500" />
                      <span className="text-xl font-bold text-blue-400">{proposal.total_points.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {proposal.skills_required && proposal.skills_required.length > 0 && (
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Skills Required</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {proposal.skills_required.map((skill: string, index: number) => (
                          <span key={index} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Creator Info */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Creator</h2>
                
                <div className="flex items-center mb-4">
                  {proposal.profiles?.avatar_url ? (
                    <Image 
                      src={proposal.profiles.avatar_url} 
                      alt={proposal.profiles.username || 'User'} 
                      width={48} 
                      height={48} 
                      className="rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-medium">
                        {proposal.profiles?.username?.substring(0, 2).toUpperCase() || 'UN'}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <div className="font-medium">{proposal.profiles?.username || 'Unknown User'}</div>
                    {proposal.profiles?.wallet_address ? (
                      <div className="text-gray-400 text-sm">
                        {proposal.profiles.wallet_address.substring(0, 6)}...
                        {proposal.profiles.wallet_address.substring(
                          (proposal.profiles.wallet_address.length || 0) - 4
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
                
                {proposal.profiles?.bio && (
                  <p className="text-gray-300 text-sm">{proposal.profiles.bio}</p>
                )}
                
                {proposal.profiles?.id && (
                  <Link href={`/admin/users/${proposal.profiles.id}`}>
                    <button className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm flex items-center justify-center">
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
                  <Link href={`/admin/proposals/${proposal.id}/edit`}>
                    <button className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm flex items-center justify-center">
                      <FileEdit size={16} className="mr-2" />
                      Edit Proposal
                    </button>
                  </Link>
                  
                  {proposal.status === 'approved' && (
                    <Link href={`/admin/projects?proposal=${proposal.id}`}>
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm flex items-center justify-center">
                        <FileText size={16} className="mr-2" />
                        View Project
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Mark as Under Review Modal */}
      {showUnderReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Mark as Under Review</h3>
            <p className="text-gray-300 mb-4">
              This will change the proposal status to "Under Review" and notify the submitter.
            </p>
            
            <div className="mb-4">
              <label htmlFor="feedback" className="block text-sm font-medium mb-2">
                Feedback or Questions (Optional)
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any notes, questions, or feedback for the submitter..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUnderReviewModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm"
              >
                Cancel
              </button>
              
              <button
                onClick={() => updateStatus('under_review')}
                disabled={statusLoading}
                className={`bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm flex items-center ${
                  statusLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {statusLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Clock size={16} className="mr-2" />
                    Mark as Under Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Approve Proposal</h3>
            <p className="text-gray-300 mb-4">
              This will approve the proposal and create a new project based on it. The submitter will be notified.
            </p>
            
            <div className="mb-4">
              <label htmlFor="approvalFeedback" className="block text-sm font-medium mb-2">
                Approval Feedback
              </label>
              <textarea
                id="approvalFeedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any comments or instructions for the submitter..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm"
              >
                Cancel
              </button>
              
              <button
                onClick={() => updateStatus('approved')}
                disabled={statusLoading}
                className={`bg-green-600 hover:bg-green-500 text-white rounded-lg px-4 py-2 text-sm flex items-center ${
                  statusLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {statusLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Approve Proposal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reject Proposal</h3>
            <p className="text-gray-300 mb-4">
              This will reject the proposal. Please provide feedback on why this proposal is being rejected.
            </p>
            
            <div className="mb-4">
              <label htmlFor="rejectionFeedback" className="block text-sm font-medium mb-2">
                Rejection Feedback <span className="text-red-400">*</span>
              </label>
              <textarea
                id="rejectionFeedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Explain why this proposal is being rejected..."
                required
              />
              {showRejectModal && !feedback.trim() && (
                <p className="mt-1 text-sm text-red-400">Feedback is required when rejecting a proposal.</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm"
              >
                Cancel
              </button>
              
              <button
                onClick={() => updateStatus('rejected')}
                disabled={statusLoading || !feedback.trim()}
                className={`bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 text-sm flex items-center ${
                  (statusLoading || !feedback.trim()) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {statusLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <X size={16} className="mr-2" />
                    Reject Proposal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}