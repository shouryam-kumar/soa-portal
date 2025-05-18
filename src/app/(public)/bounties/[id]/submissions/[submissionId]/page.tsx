import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  FileText,
  Trophy,
  User,
  MessageCircle,
  AlertCircle,
  ThumbsUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import DeleteSubmissionButton from '@/components/DeleteSubmissionButton';

export const dynamic = 'force-dynamic';

export default async function SubmissionDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; submissionId: string }> 
}) {
  const { id: bountyId, submissionId } = await params;
  
  const supabase = createServerComponentClient({ cookies });
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect(`/login?redirectTo=/bounties/${bountyId}/submissions/${submissionId}`);
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
    .eq('id', submissionId)
    .eq('bounty_id', bountyId)
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

  // Format dates and get status details
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5" />,
          bgColor: 'bg-yellow-900/30',
          borderColor: 'border-yellow-800/50',
          textColor: 'text-yellow-300'
        };
      case 'approved':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          bgColor: 'bg-green-900/30',
          borderColor: 'border-green-800/50',
          textColor: 'text-green-300'
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-5 w-5" />,
          bgColor: 'bg-red-900/30',
          borderColor: 'border-red-800/50',
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

  // Pre-compute all derived values
  const statusDetails = getStatusDetails(submission.status);
  const timeAgo = formatDistanceToNow(new Date(submission.created_at), { addSuffix: true });
  const deadlineFormatted = submission.bounty.deadline 
    ? formatDate(submission.bounty.deadline)
    : 'No deadline';

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="mb-8">
          <Link 
            href={`/bounties/${bountyId}`}
            className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-8 group transition-all duration-200"
          >
            <div className="bg-purple-900/20 p-2 rounded-full mr-2 group-hover:bg-purple-900/30">
              <ArrowLeft size={16} />
            </div>
            <span>Back to Bounty</span>
          </Link>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl shadow-xl overflow-hidden">
            {/* Submission Header */}
            <div className="p-6 md:p-8 border-b border-gray-700/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{submission.title}</h1>
                <div className={`mt-3 md:mt-0 flex items-center rounded-lg px-4 py-2 ${statusDetails.bgColor} ${statusDetails.borderColor} ${statusDetails.textColor} border shadow-sm`}>
                  {statusDetails.icon}
                  <span className="ml-2 font-medium capitalize">{submission.status}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
                <div className="flex items-center bg-gray-900/50 rounded-lg py-1.5 px-3 border border-gray-700/30">
                  <Clock size={14} className="mr-2 text-purple-400" />
                  <span>Submitted {timeAgo}</span>
                </div>
                
                {submission.bounty.deadline && (
                  <div className="flex items-center bg-gray-900/50 rounded-lg py-1.5 px-3 border border-gray-700/30">
                    <Calendar size={14} className="mr-2 text-purple-400" />
                    <span>Deadline: {deadlineFormatted}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Bounty Info */}
                  <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                      <FileText size={18} className="text-purple-400" />
                      Submitted For
                    </h2>
                    
                    <Link 
                      href={`/bounties/${submission.bounty.id}`}
                      className="text-lg font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200 mb-2 block"
                    >
                      {submission.bounty.title}
                    </Link>
                    
                    <p className="text-gray-300 mb-4">{submission.bounty.short_description}</p>
                    
                    <div className="flex items-center justify-between bg-purple-900/20 rounded-lg p-3 border border-purple-700/30">
                      <div className="flex items-center">
                        <Trophy size={18} className="text-yellow-400 mr-2" />
                        <div className="text-sm text-gray-300">Potential Reward</div>
                      </div>
                      <div className="font-bold text-xl text-purple-300">{submission.bounty.total_points} points</div>
                    </div>
                    
                    {submission.status === 'approved' && submission.points_awarded && (
                      <div className="flex items-center justify-between bg-green-900/20 rounded-lg p-3 border border-green-700/30 mt-3">
                        <div className="flex items-center">
                          <ThumbsUp size={18} className="text-green-400 mr-2" />
                          <div className="text-sm text-gray-300">Points Awarded</div>
                        </div>
                        <div className="font-bold text-xl text-green-300">{submission.points_awarded} points</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Description Card */}
                  <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                      <FileText size={18} className="text-purple-400" />
                      Description
                    </h2>
                    
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 whitespace-pre-line">{submission.description}</p>
                    </div>
                  </div>
                  
                  {/* Additional Details */}
                  {submission.submission_text && (
                    <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                      <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                        <FileText size={18} className="text-purple-400" />
                        Additional Details
                      </h2>
                      
                      <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 whitespace-pre-line">{submission.submission_text}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Submission URL */}
                  {submission.submission_url && (
                    <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                      <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                        <ExternalLink size={18} className="text-purple-400" />
                        Submission URL
                      </h2>
                      
                      <a 
                        href={submission.submission_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 text-purple-400 hover:text-purple-300 hover:bg-gray-900/70 transition-all duration-200 flex items-center justify-between group"
                      >
                        <span className="truncate">{submission.submission_url}</span>
                        <ExternalLink size={16} className="flex-shrink-0 ml-2 opacity-70 group-hover:opacity-100" />
                      </a>
                    </div>
                  )}
                  
                  {/* Feedback */}
                  {submission.feedback && (
                    <div className={`rounded-xl p-6 border ${
                      submission.status === 'approved' 
                        ? 'bg-green-900/20 border-green-800/50'
                        : submission.status === 'rejected'
                        ? 'bg-red-900/20 border-red-800/50'
                        : 'bg-gray-800/70 border-gray-700/50'
                    }`}>
                      <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                        <MessageCircle size={18} className={
                          submission.status === 'approved' 
                            ? 'text-green-400' 
                            : submission.status === 'rejected'
                            ? 'text-red-400'
                            : 'text-purple-400'
                        } />
                        Feedback
                      </h2>
                      
                      <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 whitespace-pre-line">{submission.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="lg:col-span-1 space-y-6">
                  {/* Submitter Info */}
                  <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                      <User size={18} className="text-purple-400" />
                      Submitter
                    </h2>
                    
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden mr-3 border border-gray-600/50">
                        {submission.submitter.avatar_url ? (
                          <img 
                            src={submission.submitter.avatar_url} 
                            alt={submission.submitter.username || 'User'} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-300 font-bold text-lg">
                            {(submission.submitter.username || submission.submitter.full_name || 'U')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {submission.submitter.full_name || submission.submitter.username || 'Anonymous User'}
                        </div>
                        {submission.submitter.username && (
                          <div className="text-sm text-gray-400">@{submission.submitter.username}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Delete Submission Button for Owner */}
                  {isOwner && (
                    <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                      <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                        <AlertCircle size={18} className="text-purple-400" />
                        Actions
                      </h2>
                      
                      <div className="space-y-4">
                        <DeleteSubmissionButton submissionId={submissionId} bountyId={bountyId} />
                        
                        <Link href={`/bounties/${bountyId}`} className="block">
                          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2.5 px-4 transition-colors duration-200 flex items-center justify-center">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Bounty
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
