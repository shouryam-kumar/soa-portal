import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function SubmissionDetailPage({ 
  params 
}: { 
  params: { id: string; submissionId: string } 
}) {
  const supabase = createServerComponentClient({ cookies });
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect(`/login?redirectTo=/bounties/${params.id}/submissions/${params.submissionId}`);
  }

  // Fetch the submission details
  const { data: submission, error: submissionError } = await supabase
    .from('bounty_submissions')
    .select(`
      *,
      bounty:bounty_id(
        id,
        title,
        short_description,
        description,
        total_points,
        deadline,
        status
      ),
      submitter:submitter_id(
        id,
        full_name,
        username,
        avatar_url
      )
    `)
    .eq('id', params.submissionId)
    .eq('bounty_id', params.id)
    .single();
  
  if (submissionError || !submission) {
    console.error('Error fetching submission:', submissionError);
    notFound();
  }

  // Check if the user is authorized to view this submission (owner or admin)
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  
  const isAdmin = userProfile?.role === 'admin';
  const isOwner = session.user.id === submission.submitter_id;
  
  if (!isAdmin && !isOwner) {
    // Redirect to bounties page if not authorized
    redirect('/bounties');
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Determine status styling
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5" />,
          bgColor: 'bg-yellow-900/30',
          borderColor: 'border-yellow-800',
          textColor: 'text-yellow-300'
        };
      case 'approved':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          bgColor: 'bg-green-900/30',
          borderColor: 'border-green-800',
          textColor: 'text-green-300'
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-5 w-5" />,
          bgColor: 'bg-red-900/30',
          borderColor: 'border-red-800',
          textColor: 'text-red-300'
        };
      default:
        return {
          icon: null,
          bgColor: 'bg-gray-800',
          borderColor: 'border-gray-700',
          textColor: 'text-gray-300'
        };
    }
  };

  const statusDetails = getStatusDetails(submission.status);
  const timeAgo = formatDistanceToNow(new Date(submission.created_at), { addSuffix: true });
  const deadlineFormatted = submission.bounty.deadline 
    ? formatDate(submission.bounty.deadline)
    : 'No deadline';

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <Link 
            href={isAdmin ? `/admin/bounties/${params.id}` : `/bounties/my-submissions`}
            className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            {isAdmin ? 'Back to Bounty' : 'Back to My Submissions'}
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-2xl font-bold">{submission.title}</h1>
            <div className={`mt-2 md:mt-0 flex items-center rounded-lg px-3 py-1.5 ${statusDetails.bgColor} ${statusDetails.borderColor} ${statusDetails.textColor} border`}>
              {statusDetails.icon}
              <span className="ml-1.5 font-medium capitalize">{submission.status}</span>
            </div>
          </div>
        </div>

        {/* Submission Details */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Submitted For</h2>
                <Link 
                  href={`/bounties/${submission.bounty.id}`}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  {submission.bounty.title}
                </Link>
                <p className="text-gray-400 text-sm mt-1">{submission.bounty.short_description}</p>
              </div>
              
              <div className="mt-4 md:mt-0 md:text-right">
                <div className="text-sm text-gray-400 mb-1">Potential Reward</div>
                <div className="text-2xl font-bold text-purple-400">{submission.bounty.total_points} points</div>
                {submission.status === 'approved' && submission.points_awarded && (
                  <div className="text-sm text-green-400 font-medium mt-1">
                    Awarded: {submission.points_awarded} points
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 border-t border-gray-700 pt-4">
              <div className="flex items-center">
                <Clock size={14} className="mr-1.5" />
                Submitted {timeAgo}
              </div>
              {submission.bounty.deadline && (
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1.5" />
                  Deadline: {deadlineFormatted}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Submission Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Description</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-line">{submission.description}</p>
              </div>
            </div>
            
            {submission.submission_text && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Additional Details</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-line">{submission.submission_text}</p>
                </div>
              </div>
            )}
            
            {submission.submission_url && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Submission URL</h2>
                <a 
                  href={submission.submission_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 flex items-center"
                >
                  {submission.submission_url}
                  <ExternalLink size={14} className="ml-1.5" />
                </a>
              </div>
            )}
            
            {submission.feedback && (
              <div className={`border rounded-lg p-6 ${
                submission.status === 'approved' 
                  ? 'bg-green-900/20 border-green-800'
                  : submission.status === 'rejected'
                  ? 'bg-red-900/20 border-red-800'
                  : 'bg-gray-800 border-gray-700'
              }`}>
                <h2 className="text-lg font-semibold mb-4">Feedback</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-line">{submission.feedback}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-8">
            {/* Submitter Info */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Submitter</h2>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden mr-3">
                  {submission.submitter.avatar_url ? (
                    <img 
                      src={submission.submitter.avatar_url} 
                      alt={submission.submitter.username || 'User'} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 font-bold">
                      {(submission.submitter.username || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {submission.submitter.full_name || submission.submitter.username || 'Anonymous User'}
                  </div>
                  {submission.submitter.username && (
                    <div className="text-sm text-gray-400">@{submission.submitter.username}</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Admin Actions (only visible to admins) */}
            {isAdmin && submission.status === 'pending' && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Review Submission</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Approve or reject this submission. You can also provide feedback to the submitter.
                </p>
                <div className="space-y-3">
                  <Link href={`/admin/bounties/${params.id}/submissions/${params.submissionId}/approve`}>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2">
                      Approve Submission
                    </button>
                  </Link>
                  <Link href={`/admin/bounties/${params.id}/submissions/${params.submissionId}/reject`}>
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2">
                      Reject Submission
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}