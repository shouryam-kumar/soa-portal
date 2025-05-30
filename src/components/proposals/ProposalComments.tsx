'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Send, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { addProposalComment } from '@/lib/supabase';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  proposal_id?: string;
  profiles?: {
    id?: string;
    username: string | null;
    avatar_url: string | null;
    is_admin: boolean | null;
  };
};

type ProposalCommentsProps = {
  proposalId: string;
  initialComments: Comment[];
};

export default function ProposalComments({ proposalId, initialComments }: ProposalCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const commentData = await addProposalComment(proposalId, newComment);
      
      // Add the comment to our state with profile information
      setComments(prev => [
        ...prev, 
        {
          id: commentData.id,
          content: commentData.content,
          created_at: commentData.created_at || new Date().toISOString(),
          user_id: commentData.user_id,
          proposal_id: commentData.proposal_id,
          profiles: commentData.profiles
        }
      ]);
      
      setNewComment('');
      setSubmitSuccess(true);
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-lg font-bold mb-4">Discussion ({comments.length})</h2>
      
      {comments.length > 0 ? (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div 
              key={comment.id} 
              className={`p-4 rounded-lg ${
                comment.profiles?.is_admin 
                  ? 'bg-blue-900/20 border border-blue-900/50' 
                  : 'bg-gray-750 border border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  comment.profiles?.is_admin ? 'bg-blue-600' : 'bg-purple-600'
                }`}>
                  {comment.profiles?.avatar_url ? (
                    <Image 
                      src={comment.profiles.avatar_url} 
                      alt={comment.profiles.username || 'User'} 
                      width={40} 
                      height={40} 
                      className="rounded-full" 
                    />
                  ) : (
                    <span className="text-white font-medium">
                      {(comment.profiles?.username || 'UN').substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium flex items-center">
                        {comment.profiles?.username || 'Unknown User'}
                        {comment.profiles?.is_admin && (
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
      ) : (
        <div className="text-center py-6 text-gray-400 mb-6">
          No comments yet. Be the first to comment!
        </div>
      )}
      
      {/* Comment Form */}
      <form onSubmit={handleCommentSubmit} className="bg-gray-750 border border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Add Comment</h3>
        
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {submitSuccess && (
          <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Comment added successfully!
          </div>
        )}
        
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment here..."
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
          disabled={submitting}
        ></textarea>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className={`flex items-center bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 transition-colors ${
              (!newComment.trim() || submitting) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? (
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
      </form>
    </div>
  );
} 