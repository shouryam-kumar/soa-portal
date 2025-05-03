// src/app/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Database } from '@/types/database.types';
import { 
  Award, 
  Briefcase, 
  Calendar, 
  FileText, 
  Gift, 
  MessageSquare, 
  PenTool, 
  PlusCircle, 
  User,
  Wallet
} from 'lucide-react';

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
    if (!status) return 'bg-gray-500 text-white';
    
    switch(status) {
      case 'draft':
        return 'bg-gray-500 text-white';
      case 'submitted':
        return 'bg-blue-500 text-white';
      case 'approved':
        return 'bg-green-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome back, {profile?.username || session.user.email?.split('@')[0] || 'User'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link
            href="/proposals/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle size={16} className="mr-2" />
            Create New Proposal
          </Link>
          
          <Link
            href="/ideaboard"
            className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <PenTool size={16} className="mr-2" />
            Browse Ideas
          </Link>
        </div>
      </div>
      
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Profile and Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile Card */}
          <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Your Profile</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                {profile?.avatar_url ? (
                  <div className="mb-4">
                    <Image
                      src={profile.avatar_url}
                      alt="Profile"
                      width={100}
                      height={100}
                      className="rounded-full border-4 border-gray-700"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 mb-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {(profile?.username?.charAt(0) || session.user.email?.charAt(0) || 'U').toUpperCase()}
                    </span>
                  </div>
                )}
                
                <h3 className="text-xl font-bold">
                  {profile?.username || session.user.email?.split('@')[0] || 'User'}
                </h3>
                <p className="text-gray-400 mb-2">{session.user.email}</p>
                
                {profile?.role && (
                  <span className="bg-gray-700 text-blue-300 px-3 py-1 rounded-full text-xs">
                    {profile.role}
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                {profile?.bio && (
                  <div>
                    <h4 className="text-sm uppercase text-gray-500 font-medium mb-1">Bio</h4>
                    <p className="text-gray-300 text-sm">{profile.bio}</p>
                  </div>
                )}
                
                {profile?.wallet_address && (
                  <div>
                    <h4 className="text-sm uppercase text-gray-500 font-medium mb-1">Wallet</h4>
                    <div className="flex items-center">
                      <Wallet size={16} className="text-gray-400 mr-2" />
                      <p className="text-gray-300 text-sm font-mono truncate">
                        {profile.wallet_address}
                      </p>
                    </div>
                  </div>
                )}
                
                {profile?.created_at && (
                  <div>
                    <h4 className="text-sm uppercase text-gray-500 font-medium mb-1">Member Since</h4>
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-400 mr-2" />
                      <p className="text-gray-300 text-sm">
                        {formatDate(profile.created_at)}
                      </p>
                    </div>
                  </div>
                )}
                
                {profile?.skills && profile.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm uppercase text-gray-500 font-medium mb-1">Skills</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <Link href="/profile" className="text-blue-400 text-sm hover:text-blue-300 inline-flex items-center">
                    <User size={14} className="mr-1" />
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Card */}
          <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Your Stats</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Proposals</p>
                  <div className="flex items-center">
                    <FileText size={18} className="text-blue-400 mr-2" />
                    <p className="text-2xl font-bold">{userProposals?.length || 0}</p>
                  </div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Points</p>
                  <div className="flex items-center">
                    <Award size={18} className="text-yellow-400 mr-2" />
                    <p className="text-2xl font-bold">{profile?.okto_points || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Links Card */}
          <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Quick Links</h2>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/proposals" 
                    className="flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded-md hover:text-white"
                  >
                    <FileText className="w-5 h-5 mr-3 text-blue-400" />
                    <span>All Proposals</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/bounties" 
                    className="flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded-md hover:text-white"
                  >
                    <Briefcase className="w-5 h-5 mr-3 text-green-400" />
                    <span>Open Bounties</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/ideaboard" 
                    className="flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded-md hover:text-white"
                  >
                    <PenTool className="w-5 h-5 mr-3 text-purple-400" />
                    <span>Idea Board</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/rewards" 
                    className="flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded-md hover:text-white"
                  >
                    <Gift className="w-5 h-5 mr-3 text-yellow-400" />
                    <span>Rewards Center</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Right Column - Proposals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Your Proposals */}
          <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Your Proposals</h2>
              <Link href="/proposals?filter=my" className="text-sm text-white hover:text-blue-200">
                View All
              </Link>
            </div>
            <div className="p-4">
              {userProposals && userProposals.length > 0 ? (
                <div className="space-y-3">
                  {userProposals.map((proposal) => (
                    <Link 
                      key={proposal.id} 
                      href={`/proposals/${proposal.id}`}
                      className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-white">{proposal.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(proposal.status)}`}>
                          {proposal.status ? proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) : 'Unknown'}
                        </span>
                      </div>
                      {proposal.short_description && (
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                          {proposal.short_description}
                        </p>
                      )}
                      <div className="flex items-center mt-3 text-xs text-gray-500">
                        <Calendar size={14} className="mr-1" />
                        <span>
                          {formatDate(proposal.created_at)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 mb-4">You haven't created any proposals yet.</p>
                  <Link 
                    href="/proposals/new" 
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle size={16} className="mr-2" />
                    Create your first proposal
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Latest Community Proposals */}
          <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Latest Proposals</h2>
              <Link href="/proposals" className="text-sm text-white hover:text-indigo-200">
                View All
              </Link>
            </div>
            <div className="p-4">
              {latestProposals && latestProposals.length > 0 ? (
                <div className="space-y-3">
                  {latestProposals.map((proposal) => (
                    <Link 
                      key={proposal.id} 
                      href={`/proposals/${proposal.id}`}
                      className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
                    >
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-white">{proposal.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(proposal.status)}`}>
                          {proposal.status ? proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) : 'Unknown'}
                        </span>
                      </div>
                      
                      {proposal.short_description && (
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                          {proposal.short_description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar size={14} className="mr-1" />
                          <span>
                            {formatDate(proposal.created_at)}
                          </span>
                        </div>
                        
                        {proposal.profiles && (
                          <div className="flex items-center">
                            {proposal.profiles.avatar_url ? (
                              <Image 
                                src={proposal.profiles.avatar_url} 
                                alt={proposal.profiles.username || ''} 
                                width={20} 
                                height={20} 
                                className="rounded-full mr-1"
                              />
                            ) : (
                              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-1">
                                <span className="text-white text-xs">
                                  {(proposal.profiles.username?.charAt(0) || 'U').toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="text-xs text-gray-400">
                              {proposal.profiles.username || 'Unknown user'}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No proposals have been submitted yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}