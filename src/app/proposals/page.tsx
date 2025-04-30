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

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Proposals</h1>
            <Link href="/proposals/new">
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center text-sm">
                <PlusCircle size={16} className="mr-2" />
                New Proposal
              </button>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-4">
              <Filter size={16} className="mr-2 text-gray-400" />
              <h2 className="text-sm font-medium">Filter by Status</h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Link href="/proposals">
                <div className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer ${
                  statusFilter === '' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}>
                  All
                </div>
              </Link>
              
              <Link href="/proposals?status=draft">
                <div className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer flex items-center ${
                  statusFilter === 'draft' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}>
                  Draft
                  <span className="ml-2 bg-gray-600 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                    {getStatusCount('draft')}
                  </span>
                </div>
              </Link>
              
              <Link href="/proposals?status=submitted">
                <div className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer flex items-center ${
                  statusFilter === 'submitted' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}>
                  Submitted
                  <span className="ml-2 bg-gray-600 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                    {getStatusCount('submitted')}
                  </span>
                </div>
              </Link>
              
              <Link href="/proposals?status=approved">
                <div className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer flex items-center ${
                  statusFilter === 'approved' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}>
                  Approved
                  <span className="ml-2 bg-gray-600 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                    {getStatusCount('approved')}
                  </span>
                </div>
              </Link>
              
              <Link href="/proposals?status=rejected">
                <div className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer flex items-center ${
                  statusFilter === 'rejected' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}>
                  Rejected
                  <span className="ml-2 bg-gray-600 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                    {getStatusCount('rejected')}
                  </span>
                </div>
              </Link>
              
              <Link href="/proposals?status=completed">
                <div className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer flex items-center ${
                  statusFilter === 'completed' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}>
                  Completed
                  <span className="ml-2 bg-gray-600 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
                    {getStatusCount('completed')}
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Proposals List */}
          <div className="space-y-6">
            {proposals && proposals.length > 0 ? (
              proposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 text-center">
                <h3 className="text-xl font-medium text-gray-300 mb-2">No proposals found</h3>
                <p className="text-gray-400 mb-6">
                  {statusFilter 
                    ? `There are no proposals with the status "${statusFilter}".` 
                    : "There are no proposals yet."}
                </p>
                <Link href="/proposals/new">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5">
                    Create New Proposal
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