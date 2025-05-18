import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Trophy, 
  CalendarDays, 
  User,
  FileText,
  Calendar,
  ExternalLink,
  Bookmark,
  Share2,
  ChevronDown
} from 'lucide-react';
import type { Database } from '@/types/database.types';
import Image from 'next/image';
import React from 'react';

export const dynamic = 'force-dynamic';

// Get status badge style
function getStatusBadge(status: string | null) {
  switch (status) {
    case 'open':
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-600/30 shadow-sm">
          <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
          Open
        </span>
      );
    case 'closed':
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-900/50 text-red-300 border border-red-600/30 shadow-sm">
          <XCircle className="w-3.5 h-3.5 mr-1.5" />
          Closed
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-300 border border-yellow-600/30 shadow-sm">
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          Pending
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-600/30 shadow-sm">
          {status || 'Unknown'}
        </span>
      );
  }
}

export default async function BountyDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  // Fetch all data at the top level
  const { data: bounty, error } = await supabase
    .from('proposals')
    .select('*, profiles:creator_id(username, avatar_url)')
    .eq('id', params.id)
    .eq('type', 'bounty')
    .single();

  // Fetch submissions at the top
  let submissions: any[] = [];
  let submissionsError: any = null;
  if (bounty) {
    const { data, error: subError } = await supabase
      .from('bounty_submissions')
      .select('id, title, status, created_at, submitter:submitter_id(username, avatar_url)')
      .eq('bounty_id', bounty.id)
      .order('created_at', { ascending: false });
    submissions = data || [];
    submissionsError = subError;
  }

  // Get submission stats
  const totalSubmissions = submissions.length;
  const approvedSubmissions = submissions.filter(sub => sub.status === 'approved').length;
  const uniqueSubmitters = new Set(submissions.map(sub => sub.submitter_id)).size;

  if (error || !bounty) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950 text-white">
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 max-w-md text-center shadow-xl">
          <div className="w-16 h-16 mx-auto mb-5 bg-gray-700/50 rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold mb-3">Bounty Not Found</h2>
          <p className="text-gray-400 mb-6">The bounty you are looking for does not exist or is not available.</p>
          <Link href="/bounties">
            <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2.5 transition-all duration-200 shadow-lg shadow-purple-900/20 flex items-center justify-center space-x-2 w-full">
              <ArrowLeft size={16} />
              <span>Return to Bounties</span>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Format dates for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // Calculate time remaining
  const calculateTimeRemaining = (deadlineStr: string | null) => {
    if (!deadlineStr) return null;
    
    const deadline = new Date(deadlineStr);
    const now = new Date();
    
    // If past deadline
    if (deadline < now) {
      return { expired: true, text: 'Deadline passed' };
    }
    
    const diffTime = Math.abs(deadline.getTime() - now.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      return { expired: false, text: `${diffMonths} month${diffMonths > 1 ? 's' : ''} left` };
    } else if (diffDays > 0) {
      return { expired: false, text: `${diffDays} day${diffDays > 1 ? 's' : ''} left` };
    } else {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      return { expired: false, text: `${diffHours} hour${diffHours > 1 ? 's' : ''} left` };
    }
  };

  const timeRemaining = bounty.deadline ? calculateTimeRemaining(bounty.deadline) : null;
  const deadlineFormatted = formatDate(bounty.deadline);
  const createdAtFormatted = formatDate(bounty.created_at);
  
  // Determine if bounty is active and submissions can be accepted
  const isBountyActive = bounty.status === 'approved' && 
    (!bounty.deadline || new Date(bounty.deadline) > new Date());

  // Format submission date
  const formatSubmissionDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return formatDate(dateString);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="flex flex-col mb-8">
          <Link href="/bounties" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-8 group transition-all duration-200">
            <div className="bg-purple-900/20 p-2 rounded-full mr-2 group-hover:bg-purple-900/30">
              <ArrowLeft size={16} />
            </div>
            <span>Back to Bounties</span>
          </Link>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl shadow-xl overflow-hidden">
            {/* Header Section */}
            <div className="p-6 md:p-8 border-b border-gray-700/50">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="bg-purple-900/70 text-purple-100 px-3 py-1.5 rounded-full text-xs font-semibold border border-purple-600/30 shadow-sm">
                      Bounty
                    </span>
                    
                    {getStatusBadge(bounty.status)}
                    
                    {bounty.fields?.map((field: string, index: number) => (
                      <span key={index} className="bg-gray-700/70 text-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-600/30 shadow-sm">
                        {field}
                      </span>
                    ))}
                  </div>
                  
                  <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white">{bounty.title}</h1>
                  
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
                    <div className="flex items-center bg-gray-900/50 rounded-lg py-1.5 px-3 border border-gray-700/30">
                      <Calendar size={14} className="mr-2 text-purple-400" />
                      <span className="text-sm text-gray-300">Posted {createdAtFormatted}</span>
                    </div>
                    
                    {bounty.deadline && (
                      <div className={`flex items-center rounded-lg py-1.5 px-3 border ${
                        timeRemaining?.expired 
                          ? 'bg-red-900/30 border-red-700/30 text-red-300' 
                          : 'bg-gray-900/50 border-gray-700/30 text-gray-300'
                      }`}>
                        <Clock size={14} className={`mr-2 ${timeRemaining?.expired ? 'text-red-400' : 'text-purple-400'}`} />
                        <span className="text-sm">
                          {timeRemaining?.text || deadlineFormatted}
                        </span>
                      </div>
                    )}
                    
                    {bounty.profiles && (
                      <div className="flex items-center bg-gray-900/50 rounded-lg py-1.5 px-3 border border-gray-700/30">
                        <User size={14} className="mr-2 text-purple-400" />
                        <span className="text-sm text-gray-300">Posted by {bounty.profiles.username || 'Anonymous'}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 sm:self-start">
                  {isBountyActive && (
                    <Link href={`/bounties/${bounty.id}/submit`}>
                      <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-purple-900/30">
                        <FileText size={18} />
                        <span>Submit Solution</span>
                      </button>
                    </Link>
                  )}
                  
                  <div className="flex gap-2">
                    <button className="flex items-center justify-center p-3 rounded-lg transition-colors duration-200 shadow-md bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700/50">
                      <Bookmark size={18} />
                    </button>
                    
                    <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors duration-200 border border-gray-700/50 shadow-md">
                      <Share2 size={18} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Description */}
                <div className="lg:col-span-2">
                  {/* Quick Reward Info */}
                  <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 backdrop-blur-sm rounded-xl p-6 mb-8 border border-purple-700/30 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold mb-1 text-white flex items-center gap-2">
                        <Trophy size={20} className="text-yellow-400" />
                        Reward
                      </h2>
                      <p className="text-gray-300">Complete this bounty to earn points</p>
                    </div>
                    <div className="text-3xl font-bold text-purple-300">{bounty.total_points} pts</div>
                  </div>
                  
                  {/* Description Card */}
                  <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50">
                    <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                      <FileText size={20} className="text-purple-400" />
                      Description
                    </h2>
                    
                    <div className="prose prose-invert prose-sm max-w-none">
                      <div className="text-gray-300 whitespace-pre-wrap">
                        {bounty.description || 'No detailed description provided.'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Stats & Creator */}
                <div className="lg:col-span-1">
                  {/* Stats Card */}
                  <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50">
                    <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                      <Trophy size={18} className="text-purple-400" />
                      Bounty Stats
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total Submissions</span>
                        <span className="font-semibold text-white">{totalSubmissions}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Approved Solutions</span>
                        <span className="font-semibold text-white">{approvedSubmissions}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Contributors</span>
                        <span className="font-semibold text-white">{uniqueSubmitters}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Points</span>
                        <span className="font-semibold text-white flex items-center">
                          <Trophy size={14} className="text-yellow-400 mr-1" />
                          {bounty.total_points}
                        </span>
                      </div>
                      
                      {bounty.deadline && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Deadline</span>
                          <span className={`font-semibold ${timeRemaining?.expired ? 'text-red-400' : 'text-white'}`}>
                            {deadlineFormatted}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Creator Card */}
                  <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                      <User size={18} className="text-purple-400" />
                      Created By
                    </h2>
                    
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden mr-3 border border-gray-600/50">
                        {bounty.profiles?.avatar_url ? (
                          <Image 
                            src={bounty.profiles.avatar_url} 
                            alt={bounty.profiles.username || 'User'} 
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-300 font-bold text-lg">
                            {(bounty.profiles?.username || 'U')[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {bounty.profiles?.username || 'Anonymous User'}
                        </div>
                        <div className="text-sm text-gray-400">
                          Creator
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Submissions Section */}
              <div className="mt-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText size={22} className="text-purple-400" />
                    Submissions
                  </h2>
                </div>
                
                {submissionsError ? (
                  <div className="bg-red-900/30 border border-red-700/30 rounded-xl p-6 text-center">
                    <div className="text-red-300 mb-2">Error Loading Submissions</div>
                    <p className="text-gray-400 text-sm">Please try again later or contact support if the problem persists.</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center">
                    <div className="bg-gray-700/50 p-4 rounded-full inline-flex items-center justify-center mb-4">
                      <FileText size={24} className="text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Submissions Yet</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">There are no submissions for this bounty yet. Be the first to submit a solution!</p>
                    
                    {isBountyActive && (
                      <Link href={`/bounties/${bounty.id}/submit`}>
                        <button className="flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-purple-900/20 mx-auto">
                          <FileText size={16} className="mr-1" />
                          Submit Solution
                        </button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {submissions.map((sub: any) => (
                      <Link 
                        key={sub.id} 
                        href={`/bounties/${bounty.id}/submissions/${sub.id}`} 
                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:bg-gray-800/80 hover:border-purple-500/50 transition-all duration-200 shadow-md"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                sub.status === 'approved' 
                                  ? 'bg-green-900/50 text-green-300 border border-green-600/30' 
                                  : sub.status === 'rejected'
                                  ? 'bg-red-900/50 text-red-300 border border-red-600/30'
                                  : 'bg-yellow-900/50 text-yellow-300 border border-yellow-600/30'
                              }`}>
                                {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                              </span>
                              <span className="text-gray-400 text-xs">
                                Submitted {formatSubmissionDate(sub.created_at)}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-white">{sub.title}</h3>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="flex items-center mr-4">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 overflow-hidden mr-2 border border-gray-600/50">
                                {sub.submitter?.avatar_url ? (
                                  <Image
                                    src={sub.submitter.avatar_url}
                                    alt={sub.submitter.username || 'User'}
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
                                {sub.submitter?.username || 'Anonymous'}
                              </span>
                            </div>
                            
                            <div className="w-8 h-8 rounded-full bg-purple-900/20 border border-purple-700/30 flex items-center justify-center text-purple-400">
                              <ChevronDown size={18} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}