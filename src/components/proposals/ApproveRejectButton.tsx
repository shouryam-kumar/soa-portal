'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

interface ApproveRejectButtonsProps {
  proposalId: string;
}

export default function ApproveRejectButtons({ proposalId }: ApproveRejectButtonsProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const supabase = createClientComponentClient<Database>();

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: 'approved' })
        .eq('id', proposalId);
      
      if (error) {
        throw error;
      }
      
      // Create a project from the approved proposal
      const { data, error: projectError } = await supabase
        .rpc('create_project_from_proposal', { proposal_uuid: proposalId });
      
      if (projectError) {
        console.error('Error creating project:', projectError);
      }
      
      router.refresh();
    } catch (error) {
      console.error('Error approving proposal:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectFeedback.trim()) {
      return;
    }
    
    setIsRejecting(true);
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ 
          status: 'rejected',
          review_feedback: rejectFeedback
        })
        .eq('id', proposalId);
      
      if (error) {
        throw error;
      }
      
      setShowRejectModal(false);
      router.refresh();
    } catch (error) {
      console.error('Error rejecting proposal:', error);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div>
      <div className="flex space-x-2">
        <button
          onClick={handleApprove}
          disabled={isApproving}
          className={`flex items-center bg-green-700 hover:bg-green-600 text-white rounded-lg px-4 py-2 text-sm ${
            isApproving ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <CheckCircle size={16} className="mr-2" />
          {isApproving ? 'Approving...' : 'Approve'}
        </button>
        
        <button
          onClick={() => setShowRejectModal(true)}
          className="flex items-center bg-red-700 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm"
        >
          <XCircle size={16} className="mr-2" />
          Reject
        </button>
      </div>
      
      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reject Proposal</h3>
            <p className="text-gray-300 mb-4">
              Please provide feedback on why this proposal is being rejected. This information will be shared with the proposal creator.
            </p>
            
            <textarea
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
              rows={4}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your feedback here..."
            />
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm"
              >
                Cancel
              </button>
              
              <button
                onClick={handleReject}
                disabled={!rejectFeedback.trim() || isRejecting}
                className={`bg-red-700 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm ${
                  !rejectFeedback.trim() || isRejecting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}