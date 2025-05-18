import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  ExternalLink, 
  Trophy, 
  Clock, 
  Calendar, 
  User, 
  FileText, 
  Search,
  Check,
  Filter,
  ChevronRight,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function BountiesPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch bounties created by Okto team only
  const { data: bounties, error } = await supabase
    .from('proposals')
    .select(`
      *,
      profiles:creator_id(username, avatar_url),
      submissions:bounty_submissions(*)
    `)
    .eq('type', 'bounty')
    // Only show approved bounties from the Okto team
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bounties:', error);
  }

  // Fetch the current user's profile to check for existing submissions
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;

  // Function to check if user has already submitted to a bounty
  const hasSubmitted = (bountyId: string): boolean => {
    if (!bounties || !currentUserId) return false;
    
    const bounty = bounties.find(b => b.id === bountyId);
    return bounty?.submissions?.some((sub: { submitter_id: string }) => 
      sub.submitter_id === currentUserId
    ) || false;
  };

  // Format date for display
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

  // Count total and user's submissions
  const totalBounties = bounties?.length || 0;
  const userSubmittedCount = bounties?.filter(bounty => hasSubmitted(bounty.id)).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <main className="w-full max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-sm rounded-xl p-8 border border-purple-700/30 shadow-xl">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Available Bounties
              </h1>
              <p className="text-gray-300 text-lg mb-6">
                Contribute to the Okto ecosystem and earn rewards by completing these bounties created by the Okto team.
              </p>
              
              <div className="flex flex-wrap gap-4 items-center">
                <div className="bg-gray-800/70 px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-700/50">
                  <Trophy className="text-yellow-400 h-5 w-5" />
                  <span className="text-gray-300">Earn points and rewards</span>
                </div>
                
                <div className="bg-gray-800/70 px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-700/50">
                  <User className="text-purple-400 h-5 w-5" />
                  <span className="text-gray-300">Build your reputation</span>
                </div>
                
                <div className="bg-gray-800/70 px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-700/50">
                  <FileText className="text-green-400 h-5 w-5" />
                  <span className="text-gray-300">Contribute to Okto</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters and Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="stats flex flex-wrap gap-4">
            <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700/50">
              <span className="text-gray-400 text-sm">Total Bounties</span>
              <div className="text-xl font-bold text-white">{totalBounties}</div>
            </div>
            
            {currentUserId && (
              <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700/50">
                <span className="text-gray-400 text-sm">My Submissions</span>
                <div className="text-xl font-bold text-white">{userSubmittedCount}</div>
              </div>
            )}
          </div>
          
          {/* Search & Filters (Static for now) */}
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search bounties..." 
                className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <button className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-2 text-gray-300">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Bounties Grid */}
        {bounties && bounties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bounties.map((bounty) => {
              const userHasSubmitted = hasSubmitted(bounty.id);
              const timeRemaining = bounty.deadline ? calculateTimeRemaining(bounty.deadline) : null;
              
              return (
                <div 
                  key={bounty.id} 
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-200 shadow-md flex flex-col"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-purple-900/70 text-purple-100 px-2.5 py-1 rounded-full text-xs font-semibold border border-purple-600/30 shadow-sm">
                          Bounty
                        </span>
                        
                        {bounty.deadline && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center ${
                            timeRemaining?.expired 
                              ? 'bg-red-900/50 text-red-300 border border-red-600/30' 
                              : 'bg-green-900/50 text-green-300 border border-green-600/30'
                          }`}>
                            <Clock className="h-3 w-3 mr-1" />
                            {timeRemaining?.text || formatDate(bounty.deadline)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-lg font-bold text-purple-300">
                        <Trophy className="h-4 w-4 mr-1 text-yellow-400" />
                        {bounty.total_points}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 text-white line-clamp-1">{bounty.title}</h3>
                    <p className="text-gray-400 text-sm mb-6 line-clamp-2">{bounty.short_description}</p>
                    
                    <div className="flex items-center text-gray-400 text-sm mb-5">
                      <User className="h-4 w-4 mr-1.5" />
                      <span>
                        Posted by {bounty.profiles?.username || 'Okto Team'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-auto border-t border-gray-700/50 p-4 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-400">
                        {bounty.submissions?.length || 0} submissions
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/bounties/${bounty.id}`}>
                        <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-3 py-1.5 text-sm flex items-center transition-colors duration-200">
                          Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </Link>
                      
                      {userHasSubmitted ? (
                        <button disabled className="bg-green-900/50 text-green-300 border border-green-600/30 rounded-lg px-3 py-1.5 text-sm flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Submitted
                        </button>
                      ) : (
                        <Link href={`/bounties/${bounty.id}/submit`}>
                          <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-lg px-3 py-1.5 text-sm flex items-center transition-all duration-200 shadow-md shadow-purple-900/20">
                            Submit Work
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-10 text-center shadow-lg">
            <div className="w-16 h-16 mx-auto mb-5 bg-gray-700/50 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3">No bounties available</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              There are no bounties available at the moment. Please check back later for new opportunities.
            </p>
            <Link href="/dashboard">
              <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2.5 transition-colors duration-200 shadow-lg shadow-purple-900/20 flex items-center justify-center mx-auto">
                Return to Dashboard
              </button>
            </Link>
          </div>
        )}
        
        {/* My Submissions Section */}
        {currentUserId && (
          <div className="mt-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="text-purple-400 h-5 w-5" />
                My Submissions
              </h2>
              
              <Link href="/bounties/my-submissions">
                <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 flex items-center text-sm transition-colors duration-200 shadow-md shadow-purple-900/20">
                  View All My Submissions
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </button>
              </Link>
            </div>
            
            {userSubmittedCount > 0 ? (
              <p className="text-gray-300 mt-2">
                You have submitted to {userSubmittedCount} bounties. Click the button above to view all your submissions.
              </p>
            ) : (
              <p className="text-gray-400 mt-2">
                You haven't submitted to any bounties yet. Start contributing to earn rewards!
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
