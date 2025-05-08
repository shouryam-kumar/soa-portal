export const dynamic = 'force-dynamic';

// src/app/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Database } from '@/types/database.types';
import { 
  Award, 
  Users, 
  FileText, 
  Briefcase,
  PenTool, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  User,
  TrendingUp,
  CheckCircle,
  MessageSquare,
  PlusCircle,
  Wallet,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileEdit,
  X,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import ClientSidebarDebug from '@/components/layout/ClientSidebarDebug';

export default async function Dashboard() {
  // Properly handle cookies
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // Redirect to login if not authenticated
    redirect('/login');
  }
  
  // Fetch multiple data sources in parallel for better performance
  const [profileResponse, userProposalsResponse, latestProposalsResponse] = await Promise.all([
    // Fetch user profile
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single(),
    
    // Fetch user's proposals
    supabase
      .from('proposals')
      .select('id, title, status, created_at, short_description')
      .eq('creator_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    
    // Fetch latest proposals
    supabase
      .from('proposals')
      .select('id, title, status, created_at, short_description, profiles:creator_id(username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(5)
  ]);
  
  const profile = profileResponse.data;
  const userProposals = userProposalsResponse.data || [];
  const latestProposals = latestProposalsResponse.data || [];
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge styles
  const getStatusBadge = (status: string | null) => {
    if (!status) return 'bg-gray-500/60 text-gray-100';
    
    switch(status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-500/60 text-gray-100 border border-gray-400';
      case 'submitted':
        return 'bg-blue-500/60 text-blue-100 border border-blue-400';
      case 'approved':
        return 'bg-green-500/60 text-green-100 border border-green-400';
      case 'rejected':
        return 'bg-red-500/60 text-red-100 border border-red-400';
      default:
        return 'bg-gray-500/60 text-gray-100 border border-gray-400';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string | null) => {
    if (!status) return <Calendar size={14} />;
    
    switch(status.toLowerCase()) {
      case 'draft':
        return <Calendar size={14} />;
      case 'submitted':
        return <TrendingUp size={14} />;
      case 'approved':
        return <CheckCircle size={14} />;
      case 'rejected':
        return <MessageSquare size={14} />;
      default:
        return <Calendar size={14} />;
    }
  };
  
  // Fetch user's active milestones with proposal data
  const { data: activeMilestones } = await supabase
    .from('milestones')
    .select(`
      id,
      title,
      deadline,
      completed,
      points_allocated,
      proposals (
        id,
        title
      )
    `)
    .eq('completed', false)
    .order('deadline', { ascending: true });

  // Fetch recent activity from submissions, status changes, etc.
  const { data: recentActivity } = await supabase
    .from('submissions')
    .select(`
      id,
      content,
      created_at,
      approved,
      milestone_id,
      milestones (
        id,
        title,
        proposals (
          id,
          title
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get upcoming milestones
  const upcomingMilestones = activeMilestones?.filter(m => !m.completed).slice(0, 3) || [];
  
  // Get latest proposals
  const latestProposalsFromUser = userProposals?.slice(0, 3) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900">
        <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative px-8 py-12 z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center bg-white/10 rounded-full px-3 py-1 text-sm text-blue-200 backdrop-blur-sm mb-4">
                <Sparkles size={14} className="mr-1 text-blue-300" />
                <span>Welcome to your SOA Portal Dashboard</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                Hello, {profile?.username || session.user.email?.split('@')[0] || 'User'}!
                <span className="inline-block ml-2 animate-pulse">👋</span>
              </h1>
              <p className="text-blue-100 max-w-lg">
                Track your proposals, contribute to projects, and earn rewards. Your gateway to the SOA ecosystem.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link
                href="/proposals/new"
                className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <PlusCircle size={16} className="mr-2" />
                Create New Proposal
              </Link>
              
              <Link
                href="/ideaboard"
                className="inline-flex items-center px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white/90 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
              >
                <PenTool size={16} className="mr-2" />
                Browse Ideas
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug Section (only in development) */}
      <ClientSidebarDebug />
      
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Profile and Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile Card */}
          <div className="bg-gray-800/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm border border-gray-700/50">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full filter blur-xl -translate-y-1/2 translate-x-1/2"></div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <User size={18} className="mr-2" />
                Your Profile
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                {profile?.avatar_url ? (
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-50 animate-pulse"></div>
                    <Image
                      src={profile.avatar_url}
                      alt="Profile"
                      width={100}
                      height={100}
                      className="rounded-full border-4 border-gray-700 relative z-10"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 mb-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-50 animate-pulse"></div>
                    <div className="relative z-10 w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center border-4 border-gray-700">
                      <span className="text-white text-3xl font-bold">
                        {(profile?.username?.charAt(0) || session.user.email?.charAt(0) || 'U').toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-white">
                  {profile?.username || session.user.email?.split('@')[0] || 'User'}
                </h3>
                <p className="text-gray-400 mb-3">{session.user.email}</p>
                
                {profile?.role && (
                  <span className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-800/50 backdrop-blur-sm">
                    {profile.role}
                  </span>
                )}
                
                {profile?.okto_points !== undefined && (
                  <div className="mt-4 w-full bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-4 border border-indigo-800/30">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Total Points</span>
                      <div className="flex items-center text-xl font-bold text-blue-400">
                        <Award size={18} className="mr-2 text-yellow-400" />
                        {profile.okto_points}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {profile?.bio && (
                  <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                    <h4 className="text-sm uppercase text-gray-400 font-medium mb-2 flex items-center">
                      <Users size={14} className="mr-1" />
                      Bio
                    </h4>
                    <p className="text-gray-300 text-sm">{profile.bio}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  {profile?.wallet_address && (
                    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 col-span-2">
                      <h4 className="text-sm uppercase text-gray-400 font-medium mb-2 flex items-center">
                        <Wallet size={14} className="mr-1" />
                        Wallet
                      </h4>
                      <p className="text-gray-300 text-sm font-mono truncate bg-gray-800/50 rounded-lg px-3 py-1.5">
                        {profile.wallet_address}
                      </p>
                    </div>
                  )}
                  
                  {profile?.created_at && (
                    <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 col-span-2 sm:col-span-1">
                      <h4 className="text-sm uppercase text-gray-400 font-medium mb-2 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        Member Since
                      </h4>
                      <p className="text-gray-300 text-sm">
                        {formatDate(profile.created_at)}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30 col-span-2 sm:col-span-1">
                    <h4 className="text-sm uppercase text-gray-400 font-medium mb-2 flex items-center">
                      <FileText size={14} className="mr-1" />
                      Proposals
                    </h4>
                    <p className="text-2xl font-bold text-white">
                      {userProposals?.length || 0}
                    </p>
                  </div>
                </div>
                
                {profile?.skills && profile.skills.length > 0 && (
                  <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                    <h4 className="text-sm uppercase text-gray-400 font-medium mb-2 flex items-center">
                      <Sparkles size={14} className="mr-1" />
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.skills.map((skill: string, index: number) => (
                        <span 
                          key={index}
                          className="bg-blue-900/20 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-800/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <Link 
                    href="/profile" 
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition duration-200 inline-flex items-center justify-center"
                  >
                    <User size={16} className="mr-2" />
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Links Card */}
          <div className="bg-gray-800/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm border border-gray-700/50">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full filter blur-xl -translate-y-1/2 translate-x-1/2"></div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <Sparkles size={18} className="mr-2" />
                Quick Links
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href="/proposals" 
                  className="flex flex-col items-center p-4 text-gray-300 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 hover:text-white transition duration-200 border border-gray-600/30"
                >
                  <FileText className="w-8 h-8 mb-2 text-blue-400" />
                  <span>Proposals</span>
                </Link>
                <Link 
                  href="/bounties" 
                  className="flex flex-col items-center p-4 text-gray-300 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 hover:text-white transition duration-200 border border-gray-600/30"
                >
                  <Briefcase className="w-8 h-8 mb-2 text-green-400" />
                  <span>Bounties</span>
                </Link>
                <Link 
                  href="/ideaboard" 
                  className="flex flex-col items-center p-4 text-gray-300 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 hover:text-white transition duration-200 border border-gray-600/30"
                >
                  <PenTool className="w-8 h-8 mb-2 text-purple-400" />
                  <span>Idea Board</span>
                </Link>
                <Link 
                  href="/rewards" 
                  className="flex flex-col items-center p-4 text-gray-300 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 hover:text-white transition duration-200 border border-gray-600/30"
                >
                  <Award className="w-8 h-8 mb-2 text-yellow-400" />
                  <span>Rewards</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Proposals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Your Proposals */}
          <div className="bg-gray-800/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm border border-gray-700/50">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 flex justify-between items-center relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full filter blur-xl -translate-y-1/2 translate-x-1/2"></div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <FileText size={18} className="mr-2" />
                Your Proposals
              </h2>
              <Link href="/proposals?filter=my" className="text-sm text-white/90 hover:text-white bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition duration-200">
                View All
              </Link>
            </div>
            <div className="p-5">
              {userProposals && userProposals.length > 0 ? (
                <div className="space-y-4">
                  {userProposals.map((proposal) => (
                    <Link 
                      key={proposal.id} 
                      href={`/proposals/${proposal.id}`}
                      className="group block bg-gray-700/40 rounded-xl p-5 hover:bg-gray-700/60 transition-all duration-200 border border-gray-600/30 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-900/10"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-white group-hover:text-blue-300 transition duration-200">{proposal.title}</h3>
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${getStatusBadge(proposal.status)}`}>
                          {getStatusIcon(proposal.status)}
                          <span>
                            {proposal.status ? proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) : 'Unknown'}
                          </span>
                        </span>
                      </div>
                      {proposal.short_description && (
                        <p className="text-gray-300 text-sm mt-2 line-clamp-2 group-hover:text-gray-200 transition duration-200">
                          {proposal.short_description}
                        </p>
                      )}
                      <div className="flex items-center mt-3 text-xs text-gray-400 group-hover:text-gray-300 transition duration-200">
                        <Calendar size={14} className="mr-1" />
                        <span>
                          {formatDate(proposal.created_at)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4 border-2 border-dashed border-gray-700 rounded-xl">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/20 mb-4">
                    <FileText size={32} className="text-blue-400" />
                  </div>
                  <p className="text-gray-300 mb-4">You haven't created any proposals yet.</p>
                  <Link 
                    href="/proposals/new" 
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition duration-200"
                  >
                    <PlusCircle size={16} className="mr-2" />
                    Create your first proposal
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Latest Community Proposals */}
          <div className="bg-gray-800/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm border border-gray-700/50">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex justify-between items-center relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full filter blur-xl -translate-y-1/2 translate-x-1/2"></div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <Users size={18} className="mr-2" />
                Latest Community Proposals
              </h2>
              <Link href="/proposals" className="text-sm text-white/90 hover:text-white bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition duration-200">
                View All
              </Link>
            </div>
            <div className="p-5">
              {latestProposals && latestProposals.length > 0 ? (
                <div className="space-y-4">
                  {latestProposals.map((proposal) => (
                    <Link 
                      key={proposal.id} 
                      href={`/proposals/${proposal.id}`}
                      className="group block bg-gray-700/40 rounded-xl p-5 hover:bg-gray-700/60 transition-all duration-200 border border-gray-600/30 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-900/10"
                    >
                      <div className="flex justify-between mb-3">
                        <h3 className="font-semibold text-white group-hover:text-purple-300 transition duration-200">{proposal.title}</h3>
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${getStatusBadge(proposal.status)}`}>
                          {getStatusIcon(proposal.status)}
                          <span>
                            {proposal.status ? proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) : 'Unknown'}
                          </span>
                        </span>
                      </div>
                      
                      {proposal.short_description && (
                        <p className="text-gray-300 text-sm mt-2 line-clamp-2 group-hover:text-gray-200 transition duration-200">
                          {proposal.short_description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-gray-400 flex items-center group-hover:text-gray-300 transition duration-200">
                          <Calendar size={14} className="mr-1" />
                          <span>
                            {formatDate(proposal.created_at)}
                          </span>
                        </div>
                        
                        {proposal.profiles && (
                          <div className="flex items-center bg-gray-800/60 px-2 py-1 rounded-full">
                            {proposal.profiles.avatar_url ? (
                              <div className="relative">
                                <div className="absolute inset-0 bg-purple-500 rounded-full blur opacity-30"></div>
                                <Image 
                                  src={proposal.profiles.avatar_url} 
                                  alt={proposal.profiles.username || ''} 
                                  width={20} 
                                  height={20} 
                                  className="rounded-full mr-1 relative z-10"
                                />
                              </div>
                            ) : (
                              <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-1">
                                <span className="text-white text-xs">
                                  {(proposal.profiles.username?.charAt(0) || 'U').toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="text-xs text-gray-400 group-hover:text-gray-300 transition duration-200">
                              {proposal.profiles.username || 'Unknown user'}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4 border-2 border-dashed border-gray-700 rounded-xl">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-900/20 mb-4">
                    <MessageSquare size={32} className="text-purple-400" />
                  </div>
                  <p className="text-gray-300">No proposals have been submitted yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}