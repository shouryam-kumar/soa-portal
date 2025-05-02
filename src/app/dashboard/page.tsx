// src/app/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Database } from '@/types/database.types';

export default async function Dashboard() {
  // Properly handle cookies with async await pattern
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
  
  // Use Promise.all to run parallel queries for better performance
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
      .select('id, title, status, created_at')
      .eq('creator_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    
    // Fetch latest proposals
    supabase
      .from('proposals')
      .select('id, title, status, created_at, profiles:creator_id(username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(5)
  ]);
  
  const profile = profileResponse.data;
  const userProposals = userProposalsResponse.data || [];
  const latestProposals = latestProposalsResponse.data || [];
  
  // Handle case where profile doesn't exist yet
  if (!profile) {
    // Redirect to complete profile if needed
    redirect('/complete-profile');
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400">
            Welcome back, {profile?.username || session.user.email?.split('@')[0] || 'User'}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link
            href="/proposals/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Proposal
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {(profile?.username?.charAt(0) || session.user.email?.charAt(0) || 'U').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium">
                {profile?.username || session.user.email?.split('@')[0] || 'User'}
              </h3>
              <p className="text-gray-400">{session.user.email}</p>
              <Link href="/profile" className="text-blue-400 text-sm hover:text-blue-300 mt-2 inline-block">
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
        
        {/* Stats Card */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Proposals</p>
              <p className="text-2xl font-bold">{userProposals?.length || 0}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Points</p>
              <p className="text-2xl font-bold">{profile?.okto_points || 0}</p>
            </div>
          </div>
        </div>
        
        {/* Quick Links Card */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          
          <ul className="space-y-2">
            <li>
              <Link href="/proposals" className="text-blue-400 hover:text-blue-300">
                All Proposals
              </Link>
            </li>
            <li>
              <Link href="/bounties" className="text-blue-400 hover:text-blue-300">
                Open Bounties
              </Link>
            </li>
            <li>
              <Link href="/ideaboard" className="text-blue-400 hover:text-blue-300">
                Idea Board
              </Link>
            </li>
            <li>
              <Link href="/rewards" className="text-blue-400 hover:text-blue-300">
                Rewards Center
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Proposals */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Proposals</h2>
            <Link href="/proposals?filter=my" className="text-sm text-blue-400 hover:text-blue-300">
              View All
            </Link>
          </div>
          
          {userProposals && userProposals.length > 0 ? (
            <ul className="space-y-3">
              {userProposals.map((proposal) => (
                <li key={proposal.id} className="bg-gray-700 rounded-md p-3">
                  <Link href={`/proposals/${proposal.id}`} className="block hover:bg-gray-600 rounded">
                    <h3 className="font-medium">{proposal.title}</h3>
                    <div className="flex items-center mt-2 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        proposal.status === 'draft' ? 'bg-gray-500' : 
                        proposal.status === 'submitted' ? 'bg-blue-500' : 
                        proposal.status === 'approved' ? 'bg-green-500' : 
                        proposal.status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
                      }`}>
                        {proposal.status && proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </span>
                      <span className="text-gray-400 ml-2">
                        {proposal.created_at && new Date(proposal.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400">You haven't created any proposals yet.</p>
              <Link 
                href="/proposals/new" 
                className="mt-2 inline-block text-blue-400 hover:text-blue-300"
              >
                Create your first proposal
              </Link>
            </div>
          )}
        </div>
        
        {/* Latest Proposals */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Latest Proposals</h2>
            <Link href="/proposals" className="text-sm text-blue-400 hover:text-blue-300">
              View All
            </Link>
          </div>
          
          {latestProposals && latestProposals.length > 0 ? (
            <ul className="space-y-3">
              {latestProposals.map((proposal) => (
                <li key={proposal.id} className="bg-gray-700 rounded-md p-3">
                  <Link href={`/proposals/${proposal.id}`} className="block hover:bg-gray-600 rounded">
                    <h3 className="font-medium">{proposal.title}</h3>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          proposal.status === 'draft' ? 'bg-gray-500' : 
                          proposal.status === 'submitted' ? 'bg-blue-500' : 
                          proposal.status === 'approved' ? 'bg-green-500' : 
                          proposal.status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
                        }`}>
                          {proposal.status && proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </span>
                        <span className="text-gray-400 ml-2">
                          {proposal.created_at && new Date(proposal.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {proposal.profiles && (
                        <div className="flex items-center">
                          {proposal.profiles.avatar_url ? (
                            <img 
                              src={proposal.profiles.avatar_url} 
                              alt={proposal.profiles.username || ''} 
                              className="w-5 h-5 rounded-full mr-1"
                            />
                          ) : (
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center mr-1">
                              <span className="text-white text-xs">
                                {proposal.profiles.username?.charAt(0)?.toUpperCase() || 'U'}
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
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400">No proposals have been submitted yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}