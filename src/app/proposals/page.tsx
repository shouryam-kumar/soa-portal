import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PlusCircle, Filter } from 'lucide-react';
import ProposalCard from '@/components/proposals/ProposalCard';
import Sidebar from '@/components/layout/Sidebar';

export const dynamic = 'force-dynamic';

export default async function ProposalsPage({
  searchParams
}: {
  searchParams: { status?: string }
}) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Get status filter from query params
  const statusFilter = searchParams.status || '';
  
  // Fetch proposals with filtering
  let query = supabase
    .from('proposals')
    .select(`
      *,
      profiles:creator_id(username, avatar_url),
      milestones(*)
    `)
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data: proposals, error } = await query;

  // Debug log for server
  console.log(`[ProposalsPage] Fetched ${proposals?.length || 0} proposals`);
  if (proposals && proposals.length > 0) {
    console.log('[ProposalsPage] First proposal:', {
      id: proposals[0].id,
      title: proposals[0].title,
      creator_id: proposals[0].creator_id,
      status: proposals[0].status
    });
  }

  if (error) {
    console.error('Error fetching proposals:', error);
  }

  // Get status counts for filter badges
  const { data: allProposals } = await supabase
    .from('proposals')
    .select('status');
  
  // Count statuses on the client
  const statusCounts = allProposals ? 
    Array.from(
      allProposals.reduce((acc, { status }) => {
        if (status) {
          acc.set(status, (acc.get(status) || 0) + 1);
        }
        return acc;
      }, new Map())
    ).map(([status, count]) => ({ status, count })) : [];

  const getStatusCount = (status: string) => {
    const found = statusCounts.find((item) => item.status === status);
    return found ? found.count : 0;
  };

  // Get the current session to check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Proposals</h1>
          <p className="text-gray-400">Browse submitted proposals or submit your own</p>
        </div>
        
        {isLoggedIn && (
          <Link href="/proposals/new">
            <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 px-4 flex items-center">
              <PlusCircle size={16} className="mr-2" />
              Create Proposal
            </button>
          </Link>
        )}
      </div>
      
      {/* Status filters */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        <Link href="/proposals">
          <button className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !statusFilter ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}>
            All ({allProposals?.length || 0})
          </button>
        </Link>
        
        <Link href="/proposals?status=approved">
          <button className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            statusFilter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}>
            <span className="flex items-center">
              Approved ({getStatusCount('approved')})
            </span>
          </button>
        </Link>
        
        <Link href="/proposals?status=submitted">
          <button className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            statusFilter === 'submitted' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}>
            <span className="flex items-center">
              Submitted ({getStatusCount('submitted')})
            </span>
          </button>
        </Link>
        
        <Link href="/proposals?status=rejected">
          <button className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            statusFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}>
            <span className="flex items-center">
              Rejected ({getStatusCount('rejected')})
            </span>
          </button>
        </Link>
        
        <Link href="/proposals?status=draft">
          <button className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            statusFilter === 'draft' ? 'bg-gray-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}>
            <span className="flex items-center">
              Draft ({getStatusCount('draft')})
            </span>
          </button>
        </Link>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals && proposals.length > 0 ? (
          proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))
        ) : (
          <div className="col-span-full text-center bg-gray-800 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-white mb-2">No proposals found</h3>
            <p className="text-gray-400 mb-6">
              {statusFilter 
                ? `There are no proposals with status "${statusFilter}".`
                : 'No proposals have been submitted yet.'}
            </p>
            
            {isLoggedIn && (
              <Link href="/proposals/new">
                <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 px-4 flex items-center mx-auto">
                  <PlusCircle size={16} className="mr-2" />
                  Create the first proposal
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}