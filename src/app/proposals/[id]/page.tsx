import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Award, Tag, ArrowLeft, CheckCircle, MessageCircle, User } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import ApproveRejectButtons from '@/components/proposals/ApproveRejectButton';
import type { Database } from '@/types/database.types';

// Define Types
type Milestone = Database['public']['Tables']['milestones']['Row'];
type Proposal = Database['public']['Tables']['proposals']['Row'] & {
  profiles: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    bio: string | null;
    wallet_address: string | null;
  } | null;
  milestones: Milestone[];
};

export const dynamic = 'force-dynamic';

export default async function ProposalDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  // Fetch proposal details
  const { data: proposal, error } = await supabase
    .from('proposals')
    .select(`
      *,
      profiles:creator_id(id, username, avatar_url, bio, wallet_address),
      milestones(*)
    `)
    .eq('id', params.id)
    .single();

  if (error || !proposal) {
    console.error('Error fetching proposal:', error);
    notFound();
  }

  // Get current user to determine if they can approve/reject
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  // Check if user is an admin
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId || '')
    .single();
  
  const isAdmin = userProfile?.role === 'admin';
  const isCreator = userId === proposal.creator_id;
  
  // Format the date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Determine status badge style
  const getStatusBadgeStyle = (status: string | null) => {
    switch (status) {
      case 'approved':
        return 'bg-green-900 text-green-300';
      case 'submitted':
        return 'bg-yellow-900 text-yellow-300';
      case 'rejected':
        return 'bg-red-900 text-red-300';
      case 'completed':
        return 'bg-blue-900 text-blue-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Calculate milestone completion
  const totalMilestones = proposal.milestones?.length || 0;
  const completedMilestones = proposal.milestones?.filter((m: Milestone) => m.completed).length || 0;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-6">
            <Link href="/proposals" className="text-blue-400 hover:text-blue-300 flex items-center mb-4">
              <ArrowLeft size={16} className="mr-1" />
              Back to Proposals
            </Link>
            
            <div className="flex justify-between items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-lg ${
                    proposal.type === 'project' 
                      ? 'bg-blue-900 text-blue-300' 
                      : 'bg-purple-900 text-purple-300'
                  }`}>
                    {proposal.type.charAt(0).toUpperCase() + proposal.type.slice(1)}
                  </span>
                  
                  <span className={`text-xs px-2 py-1 rounded-lg ${getStatusBadgeStyle(proposal.status)}`}>
                    {proposal.status ? proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) : 'Unknown'}
                  </span>
                  
                  {proposal.fields?.map((field: string, index: number) => (
                    <span key={index} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-lg">
                      {field}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl font-bold mb-2">{proposal.title}</h1>
              </div>
              
              {(isAdmin && proposal.status === 'submitted') && (
                <ApproveRejectButtons proposalId={proposal.id} />
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
              
              {/* Review Feedback (if rejected) */}
              {proposal.status === 'rejected' && proposal.review_feedback && (
                <div className="bg-red-900/30 border border-red-900 rounded-lg p-6">
                  <h2 className="text-lg font-bold mb-3 flex items-center">
                    <MessageCircle size={18} className="mr-2" />
                    Rejection Feedback
                  </h2>
                  <p className="text-gray-300">{proposal.review_feedback}</p>
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
                      <span className="text-xl font-bold text-blue-400">{proposal.total_points}</span>
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
                  <Link href={`/profile/${proposal.profiles.id}`}>
                    <button className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm flex items-center justify-center">
                      <User size={16} className="mr-2" />
                      View Profile
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}