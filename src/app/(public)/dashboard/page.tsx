import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { File, Users, Award, Clock, PlusCircle, ArrowRight, Calendar } from 'lucide-react';
import ProposalCard from '@/components/proposals/ProposalCard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  if (!userId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to view your dashboard</h2>
          <Link href="/login">
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  // Fetch user's proposals
  const { data: userProposals } = await supabase
    .from('proposals')
    .select(`
      *,
      profiles:creator_id(username, avatar_url),
      milestones(*)
    `)
    .eq('creator_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);
  
  // Fetch user's active projects
  const { data: userProjects } = await supabase
    .from('projects')
    .select(`
      *,
      proposals(*),
      project_members!inner(*)
    `)
    .eq('project_members.user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);
  
  // Fetch recent activity (new proposals, projects)
  const { data: recentProposals } = await supabase
    .from('proposals')
    .select(`
      *,
      profiles:creator_id(username, avatar_url)
    `)
    .neq('creator_id', userId) // Exclude user's own proposals
    .order('created_at', { ascending: false })
    .limit(5);
  
  // Fetch upcoming deadlines
  const today = new Date();
  const { data: upcomingMilestones } = await supabase
    .from('milestones')
    .select(`
      *,
      proposals!inner(
        id,
        title,
        creator_id,
        profiles:creator_id(username)
      )
    `)
    .or(`proposals.creator_id.eq.${userId},proposals.creator_id.neq.${userId}`)
    .gte('deadline', today.toISOString())
    .order('deadline', { ascending: true })
    .limit(5);
  
  // Format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // Calculate days until deadline
  const getDaysUntil = (dateString: string) => {
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <File className="text-blue-500" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">My Proposals</p>
                <h3 className="text-2xl font-bold">{userProposals?.length || 0}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Users className="text-green-500" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Active Projects</p>
                <h3 className="text-2xl font-bold">{userProjects?.length || 0}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Award className="text-purple-500" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">OKTO Points</p>
                <h3 className="text-2xl font-bold">{profile?.okto_points || 0}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <Clock className="text-yellow-500" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Upcoming Deadlines</p>
                <h3 className="text-2xl font-bold">{upcomingMilestones?.length || 0}</h3>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Proposals */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">My Proposals</h2>
                <Link href="/proposals" className="text-blue-400 hover:text-blue-300 flex items-center text-sm">
                  View All
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
              
              {userProposals && userProposals.length > 0 ? (
                <div className="space-y-4">
                  {userProposals.map((proposal) => (
                    <ProposalCard key={proposal.id} proposal={proposal} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-700 border border-gray-600 border-dashed rounded-lg p-6 text-center">
                  <p className="text-gray-400 mb-4">You haven't created any proposals yet</p>
                  <Link href="/proposals/new">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center justify-center mx-auto">
                      <PlusCircle size={16} className="mr-2" />
                      Create New Proposal
                    </button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Recent Activity */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              
              {recentProposals && recentProposals.length > 0 ? (
                <div className="space-y-4">
                  {recentProposals.map((proposal) => (
                    <div key={proposal.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            proposal.type === 'project' 
                              ? 'bg-blue-900 text-blue-300' 
                              : 'bg-purple-900 text-purple-300'
                          } mr-2`}>
                            {proposal.type.charAt(0).toUpperCase() + proposal.type.slice(1)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            proposal.status === 'approved' ? 'bg-green-900 text-green-300' :
                            proposal.status === 'submitted' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-gray-600 text-gray-300'
                          }`}>
                            {proposal.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(proposal.created_at)}</span>
                      </div>
                      
                      <Link href={`/proposals/${proposal.id}`}>
                        <h3 className="font-medium mb-2 hover:text-blue-400">{proposal.title}</h3>
                      </Link>
                      
                      <p className="text-gray-400 text-sm mb-2">{proposal.short_description}</p>
                      
                      <div className="flex items-center text-sm text-gray-400">
                        <span>by {proposal.profiles?.username || 'Unknown User'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-6">No recent activity</div>
              )}
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Upcoming Deadlines</h2>
              
              {upcomingMilestones && upcomingMilestones.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMilestones.map((milestone) => {
                    const daysUntil = getDaysUntil(milestone.deadline);
                    const isUrgent = daysUntil <= 3;
                    
                    return (
                      <div 
                        key={milestone.id} 
                        className={`border-l-4 ${
                          isUrgent ? 'border-red-500' : 'border-yellow-500'
                        } bg-gray-700 rounded-r-lg p-4`}
                      >
                        <Link href={`/proposals/${milestone.proposals.id}`}>
                          <h4 className="font-medium hover:text-blue-400">{milestone.title}</h4>
                        </Link>
                        <p className="text-sm text-gray-400 mb-2">
                          For: {milestone.proposals.title}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm">
                            <Calendar size={14} className="mr-1 text-gray-500" />
                            <span>{formatDate(milestone.deadline)}</span>
                          </div>
                          
                          <span className={`text-xs font-bold ${
                            isUrgent ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {daysUntil} {daysUntil === 1 ? 'day' : 'days'} left
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-6">No upcoming deadlines</div>
              )}
            </div>
            
            {/* Program Stats */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Program Stats</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Projects</span>
                  <span className="font-bold">24</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Participants</span>
                  <span className="font-bold">187</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Proposals</span>
                  <span className="font-bold">156</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Points Distributed</span>
                  <span className="font-bold">3.2M</span>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Quick Links</h2>
              
              <div className="space-y-2">
                <Link href="/proposals/new">
                  <div className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 flex items-center">
                    <PlusCircle size={18} className="mr-3 text-blue-400" />
                    <span>Submit New Proposal</span>
                  </div>
                </Link>
                
                <Link href="/ideaboard">
                  <div className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 flex items-center">
                    <File size={18} className="mr-3 text-green-400" />
                    <span>Browse Idea Board</span>
                  </div>
                </Link>
                
                <Link href="/projects">
                  <div className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 flex items-center">
                    <Users size={18} className="mr-3 text-purple-400" />
                    <span>View Active Projects</span>
                  </div>
                </Link>
                
                <Link href="/profile">
                  <div className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 flex items-center">
                    <Award size={18} className="mr-3 text-yellow-400" />
                    <span>Check Your Rewards</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}