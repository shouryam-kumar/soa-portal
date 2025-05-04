import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PlusCircle } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

export const dynamic = 'force-dynamic';

export default async function BountiesPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // This is a placeholder - in the future, we can fetch actual bounties
  const { data: bounties, error } = await supabase
    .from('proposals')
    .select(`
      *,
      profiles:creator_id(username, avatar_url)
    `)
    .eq('type', 'bounty')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bounties:', error);
  }

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Bounties</h1>
            <Link href="/proposals/new?type=bounty">
              <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 flex items-center text-sm">
                <PlusCircle size={16} className="mr-2" />
                New Bounty
              </button>
            </Link>
          </div>

          {/* Bounties List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bounties && bounties.length > 0 ? (
              bounties.map((bounty) => (
                <div key={bounty.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="bg-purple-900 text-purple-300 text-xs px-2 py-1 rounded-lg mb-2 inline-block">
                        Bounty
                      </span>
                      {bounty.status && (
                        <span className={`ml-2 text-xs px-2 py-1 rounded-lg ${
                          bounty.status === 'approved' ? 'bg-green-900 text-green-300' :
                          bounty.status === 'submitted' ? 'bg-yellow-900 text-yellow-300' :
                          bounty.status === 'rejected' ? 'bg-red-900 text-red-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {bounty.status.charAt(0).toUpperCase() + bounty.status.slice(1)}
                        </span>
                      )}
                      <h3 className="text-lg font-bold mt-2">{bounty.title}</h3>
                    </div>
                    <div className="text-2xl font-bold text-purple-400">{bounty.total_points}</div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{bounty.short_description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                      Posted by {bounty.profiles?.username || 'Unknown User'}
                    </div>
                    <Link href={`/proposals/${bounty.id}`}>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-3 py-1 text-sm">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-gray-800 border border-gray-700 rounded-lg p-10 text-center">
                <h3 className="text-xl font-medium text-gray-300 mb-2">No bounties found</h3>
                <p className="text-gray-400 mb-6">
                  There are no bounties available yet.
                </p>
                <Link href="/proposals/new?type=bounty">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2.5">
                    Create New Bounty
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
