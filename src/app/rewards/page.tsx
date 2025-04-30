import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { DollarSign, Calendar, ArrowRight, Trophy, TrendingUp, Clock } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

export const dynamic = 'force-dynamic';

export default async function RewardsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Get user profile info with Okto points
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  // Fetch user profile info if logged in
  const { data: userProfile } = userId ? await supabase
    .from('profiles')
    .select('okto_points, username, avatar_url')
    .eq('id', userId)
    .single() : { data: null };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // Sample reward activities for demo purposes
  const rewardActivities = [
    {
      id: 1,
      title: 'Okto Documentation Revamp',
      type: 'Bounty Completion',
      amount: 20000,
      date: '2023-06-12',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Bug fix in Okto SDK Core',
      type: 'Contribution',
      amount: 5000,
      date: '2023-07-03',
      status: 'completed'
    },
    {
      id: 3,
      title: 'Community Workshop Facilitation',
      type: 'Community',
      amount: 8000,
      date: '2023-07-22',
      status: 'pending'
    }
  ];
  
  // Sample rewards program info
  const rewardsPrograms = [
    {
      id: 1,
      title: 'Okto Ambassador Program',
      description: 'Represent Okto at events, create content, and grow the community.',
      points: '500-10,000',
      icon: <TrendingUp size={20} className="text-purple-400" />
    },
    {
      id: 2,
      title: 'Okto Bug Bounty',
      description: 'Find and report security vulnerabilities in Okto products.',
      points: '1,000-25,000',
      icon: <Trophy size={20} className="text-yellow-400" />
    },
    {
      id: 3,
      title: 'Milestone Rewards',
      description: 'Complete project milestones to earn significant Okto points.',
      points: '10,000-100,000',
      icon: <Clock size={20} className="text-blue-400" />
    }
  ];

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold mb-6">Rewards Dashboard</h1>
          
          {/* User Points Summary */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
            {userProfile ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  {userProfile.avatar_url ? (
                    <Image 
                      src={userProfile.avatar_url} 
                      alt={userProfile.username || 'User'} 
                      width={48} 
                      height={48} 
                      className="rounded-full mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-medium">
                        {userProfile.username?.substring(0, 2).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold">{userProfile.username || 'User'}'s Rewards</h2>
                    <p className="text-gray-400 text-sm">Earn Okto points by contributing to the ecosystem</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg px-6 py-3 inline-flex items-center">
                  <DollarSign size={24} className="text-blue-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-300">Available Balance</div>
                    <div className="text-2xl font-bold text-white">{userProfile.okto_points?.toLocaleString() || 0} <span className="text-blue-400">OKTO</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <h2 className="text-xl font-bold mb-2">Sign in to see your rewards</h2>
                <p className="text-gray-400 mb-4">Track your contributions and earned rewards by signing in to your account</p>
                <Link href="/login">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3">
                    Sign In
                  </button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Reward Activity */}
          {userProfile && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-lg font-bold">Recent Activity</h2>
              </div>
              
              <div className="divide-y divide-gray-700">
                {rewardActivities.map((activity) => (
                  <div key={activity.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center mb-1">
                        <span className={`text-xs px-2 py-1 rounded-full mr-2 ${
                          activity.type === 'Bounty Completion' ? 'bg-purple-900/30 text-purple-300' :
                          activity.type === 'Contribution' ? 'bg-blue-900/30 text-blue-300' :
                          'bg-green-900/30 text-green-300'
                        }`}>
                          {activity.type}
                        </span>
                        <h3 className="font-medium">{activity.title}</h3>
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(activity.date)}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`text-lg font-bold ${
                        activity.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {activity.amount.toLocaleString()} OKTO
                      </div>
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-900/30 text-green-300' : 'bg-yellow-900/30 text-yellow-300'
                      }`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Available Rewards Programs */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Ways to Earn Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rewardsPrograms.map((program) => (
                <div key={program.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-4">
                      {program.icon}
                    </div>
                    <h3 className="font-bold">{program.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{program.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-blue-400 font-medium">{program.points} OKTO</div>
                    <Link href={`/proposals/new?program=${program.id}`}>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-3 py-1 text-sm flex items-center">
                        Learn More
                        <ArrowRight size={14} className="ml-1" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Rewards Policy */}
          <div className="bg-blue-900/30 border border-blue-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-3">Rewards Policy</h2>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>
                OKTO tokens represent rewards that will be airdropped to your Okto wallet at TGE (Token Generation Event). OKTO is primarily allocated for project contributions and ecosystem building.
              </p>
              <p>
                Okto Points symbolize rewards credited pre-TGE into your Okto wallet and convert to OKTO tradable at TGE. Okto Points are usually awarded for bounty completions, community contributions, and other ecosystem activities.
              </p>
              <p>
                Following TGE, all project and bounty rewards will be distributed directly in OKTO. The exact conversion rate between Okto Points and OKTO tokens will be announced closer to the TGE date.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
