'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

interface SubmissionData {
  title: string;
  bounty: {
    title: string;
    total_points: number;
  } | Array<any>; // Allow both single object and array format
}

export default function AdminReviewPage({ 
  params 
}: { 
  params: { 
    id: string; 
    submissionId: string; 
    action: 'approve' | 'reject' 
  } 
}) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const isApproving = params.action === 'approve';
  
  const [feedback, setFeedback] = useState('');
  const [pointsAwarded, setPointsAwarded] = useState<number | ''>('');
  const [bountyTotalPoints, setBountyTotalPoints] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionTitle, setSubmissionTitle] = useState('');

  useEffect(() => {
    // Fetch the submission and bounty details
    const fetchSubmissionDetails = async () => {
      const { data, error: submissionError } = await supabase
        .from('bounty_submissions')
        .select(`
          title,
          bounty:bounty_id(
            title,
            total_points
          )
        `)
        .eq('id', params.submissionId)
        .eq('bounty_id', params.id)
        .single();
      
      if (submissionError) {
        console.error('Error fetching submission:', submissionError);
        setError('Could not load submission details');
        return;
      }
      
      if (!data) {
        setError('No submission data found');
        return;
      }
      
      // Set the submission title
      setSubmissionTitle(data.title);
      
      // Handle the bounty data, which could be in different formats
      let bountyData;
      if (Array.isArray(data.bounty)) {
        // If it's an array, take the first item
        bountyData = data.bounty[0];
      } else if (typeof data.bounty === 'object' && data.bounty !== null) {
        // If it's a single object
        bountyData = data.bounty;
      } else {
        console.error('Unexpected bounty data format:', data.bounty);
        setError('Failed to parse bounty data');
        return;
      }
      
      // Extract and convert total points to number to ensure type safety
      const totalPoints = Number(bountyData.total_points);
      if (isNaN(totalPoints)) {
        console.error('Invalid total points value:', bountyData.total_points);
        setError('Invalid points value in bounty data');
        return;
      }
      
      setBountyTotalPoints(totalPoints);
      
      // If approving, set default points to the full bounty amount
      if (isApproving) {
        setPointsAwarded(totalPoints);
      }
    };
    
    fetchSubmissionDetails();
  }, [supabase, params.id, params.submissionId, isApproving]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Validate the form
      if (!feedback.trim()) {
        throw new Error('Please provide feedback for the submitter');
      }
      
      if (isApproving && (pointsAwarded === '' || Number(pointsAwarded) <= 0)) {
        throw new Error('Please specify the points to award (must be greater than 0)');
      }
      
      if (isApproving && Number(pointsAwarded) > bountyTotalPoints) {
        throw new Error(`Points awarded cannot exceed the bounty's total points (${bountyTotalPoints})`);
      }
      
      // Update the submission
      const { error: updateError } = await supabase
        .from('bounty_submissions')
        .update({
          status: isApproving ? 'approved' : 'rejected',
          feedback,
          points_awarded: isApproving ? Number(pointsAwarded) : 0,
        })
        .eq('id', params.submissionId);
      
      if (updateError) throw updateError;
      
      // If approved, also update the user's points in their profile
      if (isApproving && pointsAwarded) {
        // First get the submitter's ID
        const { data: submission } = await supabase
          .from('bounty_submissions')
          .select('submitter_id')
          .eq('id', params.submissionId)
          .single();
        
        if (submission) {
          // Update the user's points
          const { error: profileError } = await supabase.rpc(
            'increment_user_points', 
            { 
              user_id: submission.submitter_id, 
              points_to_add: Number(pointsAwarded) 
            }
          );
          
          if (profileError) {
            console.error('Error updating user points:', profileError);
            // Continue anyway, we can fix points later if needed
          }
        }
      }
      
      // Redirect back to submission detail
      router.push(`/admin/bounties/${params.id}/submissions/${params.submissionId}`);
      router.refresh();
      
    } catch (error) {
      console.error('Error reviewing submission:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };
  
  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <Link 
          href={`/admin/bounties/${params.id}/submissions/${params.submissionId}`} 
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Submission
        </Link>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h1 className="text-xl font-bold mb-1">
            {isApproving ? 'Approve Submission' : 'Reject Submission'}
          </h1>
          <p className="text-gray-400 mb-6">
            {submissionTitle}
          </p>
          
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-start mb-6">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-300 mb-1">
                Feedback for Submitter *
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={isApproving 
                  ? "Great job! Let them know what you liked about their submission."
                  : "Explain why the submission was rejected and provide guidance for improvement."}
                rows={6}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            {isApproving && (
              <div>
                <label htmlFor="pointsAwarded" className="block text-sm font-medium text-gray-300 mb-1">
                  Points to Award *
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="pointsAwarded"
                    value={pointsAwarded}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || !isNaN(Number(value))) {
                        setPointsAwarded(value === '' ? '' : Number(value));
                      }
                    }}
                    min="1"
                    max={bountyTotalPoints}
                    placeholder="Enter points"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <span className="ml-2 text-gray-400">/ {bountyTotalPoints}</span>
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  Award up to the maximum bounty points based on the quality of the submission.
                </p>
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              <Link href={`/admin/bounties/${params.id}/submissions/${params.submissionId}`}>
                <button 
                  type="button"
                  className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-5 py-2.5 mr-3"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                className={`text-white rounded-lg px-5 py-2.5 flex items-center ${
                  isApproving 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  isApproving ? 'Approve Submission' : 'Reject Submission'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}