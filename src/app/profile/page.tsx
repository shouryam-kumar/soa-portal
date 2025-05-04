// src/app/profile/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Database } from '@/types/database.types';
import ProfileForm from '@/components/profile/ProfileForm';
import UserStatsCard from '@/components/profile/UserStatsCard';
import ActivityFeed from '@/components/profile/ActivityFeed';

export default async function ProfilePage() {
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
  
  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  // Fetch user proposals
  const { data: userProposals } = await supabase
    .from('proposals')
    .select('id, title, status, created_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5);
  
  // Since bounties table doesn't exist in your database types, we'll use what's available
  // You may need to adjust this query based on your actual database schema
  const userBounties: any[] = []; // Empty array as fallback
  
  // Transform proposals data to ensure non-nullable status and created_at
  const safeProposals = (userProposals || []).map(item => ({
    id: item.id,
    title: item.title,
    status: item.status || 'unknown',
    created_at: item.created_at || new Date().toISOString()
  }));
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl p-6 sticky top-24">
            <div className="flex flex-col items-center mb-6">
              {profile?.avatar_url ? (
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur opacity-70 animate-pulse"></div>
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    className="relative w-32 h-32 rounded-full border-4 border-gray-800 shadow-lg"
                  />
                </div>
              ) : (
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur opacity-70 animate-pulse"></div>
                  <div className="relative w-32 h-32 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center border-4 border-gray-800 shadow-lg">
                    <span className="text-white text-4xl font-bold">
                      {(profile?.username?.charAt(0) || session.user.email?.charAt(0) || 'U').toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
              
              <h2 className="text-2xl font-bold mb-1">
                {profile?.username || session.user.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-gray-400 mb-3">{session.user.email}</p>
              
              {profile?.wallet_address && (
                <div className="flex items-center bg-gray-700/50 rounded-lg py-1 px-3 text-sm text-gray-300 mb-4">
                  <span className="truncate max-w-[180px]">{profile.wallet_address}</span>
                </div>
              )}
              
              {profile?.okto_points !== undefined && (
                <div className="flex items-center justify-center w-full bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl p-4 mb-4">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Total Points</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {profile.okto_points}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {profile?.skills && profile.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-200">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-900/60 text-blue-200 border border-blue-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {profile?.bio && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-200">About</h3>
                <p className="text-gray-300 leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}
            
            <UserStatsCard 
              proposalsCount={safeProposals.length}
              bountiesCount={userBounties.length} 
              joinDate={profile?.created_at ? profile.created_at : undefined}
            />
          </div>
        </div>
        
        {/* Right Column - Form and Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Edit Form */}
          <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Your Profile
            </h3>
            <ProfileForm initialProfile={profile} userId={session.user.id} />
          </div>
          
          {/* Activity Feed */}
          <ActivityFeed 
            proposals={safeProposals} 
            bounties={userBounties} 
          />
        </div>
      </div>
    </div>
  );
}