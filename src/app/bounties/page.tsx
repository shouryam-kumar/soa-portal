import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ExternalLink } from 'lucide-react';

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

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Available Bounties</h1>
            <p className="text-gray-400">
              These bounties are created by the Okto team. You can submit your work to earn rewards.
            </p>
          </div>

          {/* Bounties List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bounties && bounties.length > 0 ? (
              bounties.map((bounty) => {
                const userHasSubmitted = hasSubmitted(bounty.id);
                
                return (
                  <div key={bounty.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="bg-purple-900 text-purple-300 text-xs px-2 py-1 rounded-lg mb-2 inline-block">
                          Bounty
                        </span>
                        {bounty.deadline && (
                          <span className="ml-2 text-xs px-2 py-1 rounded-lg bg-gray-700 text-gray-300">
                            Due: {new Date(bounty.deadline).toLocaleDateString()}
                          </span>
                        )}
                        <h3 className="text-lg font-bold mt-2">{bounty.title}</h3>
                      </div>
                      <div className="text-2xl font-bold text-purple-400">{bounty.total_points} pts</div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{bounty.short_description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        Posted by Okto Team
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/bounties/${bounty.id}`}>
                          <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-3 py-1 text-sm">
                            View Details
                          </button>
                        </Link>
                        {userHasSubmitted ? (
                          <button disabled className="bg-green-800 text-green-300 rounded-lg px-3 py-1 text-sm cursor-not-allowed">
                            Submitted
                          </button>
                        ) : (
                          <Link href={`/bounties/${bounty.id}/submit`}>
                            <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-1 text-sm">
                              Submit Work
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-gray-800 border border-gray-700 rounded-lg p-10 text-center">
                <h3 className="text-xl font-medium text-gray-300 mb-2">No bounties available</h3>
                <p className="text-gray-400 mb-6">
                  There are no bounties available at the moment. Check back later!
                </p>
                <Link href="/dashboard">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2.5">
                    Return to Dashboard
                  </button>
                </Link>
              </div>
            )}
          </div>
          
          {/* My Submissions Section */}
          {currentUserId && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6">My Submissions</h2>
              <Link href="/bounties/my-submissions">
                <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 flex items-center text-sm">
                  <ExternalLink size={16} className="mr-2" />
                  View All My Submissions
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}