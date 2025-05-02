'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { LayoutDashboard, FileText, Award, Rocket, Lightbulb, DollarSign, ChevronDown, ChevronRight } from 'lucide-react';

// Define the proposal type
type Proposal = {
  id: string;
  title: string;
  status: string | null;
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, supabase } = useSupabase();
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [myProposalsExpanded, setMyProposalsExpanded] = useState(true);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Proposals', path: '/proposals', icon: <FileText size={18} /> },
    { label: 'Bounties', path: '/bounties', icon: <Award size={18} /> },
    { label: 'Active Projects', path: '/projects', icon: <Rocket size={18} /> },
    { label: 'Idea Board', path: '/ideaboard', icon: <Lightbulb size={18} /> },
    { label: 'Rewards', path: '/rewards', icon: <DollarSign size={18} /> },
  ];

  useEffect(() => {
    const fetchMyProposals = async () => {
      if (user && supabase) {
        const { data, error } = await supabase
          .from('proposals')
          .select('id, title, status')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setMyProposals(data);
        }
      }
    };

    fetchMyProposals();
  }, [user, supabase]);

  return (
    <div className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="sticky top-0 p-4 h-screen overflow-y-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        
        <nav>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <div
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center ${
                      pathname === item.path
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          
          {user && !isCollapsed && (
            <div className="mt-8">
              <div
                onClick={() => setMyProposalsExpanded(!myProposalsExpanded)}
                className="flex items-center justify-between px-3 cursor-pointer"
              >
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  My Proposals
                </h3>
                {myProposalsExpanded ? 
                  <ChevronDown size={16} className="text-gray-400" /> : 
                  <ChevronRight size={16} className="text-gray-400" />
                }
              </div>
              
              {myProposalsExpanded && (
                <ul className="mt-2 space-y-1">
                  {myProposals.length > 0 ? (
                    myProposals.map((proposal: Proposal) => (
                      <li key={proposal.id}>
                        <Link href={`/proposals/${proposal.id}`}>
                          <div className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white text-sm flex items-center">
                            <span className="flex-1 truncate">{proposal.title}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              proposal.status === 'approved' ? 'bg-green-900 text-green-300' :
                              proposal.status === 'submitted' ? 'bg-yellow-900 text-yellow-300' :
                              proposal.status === 'rejected' ? 'bg-red-900 text-red-300' :
                              'bg-gray-700 text-gray-300'
                            }`}>
                              {proposal.status}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-sm text-gray-400">
                      No proposals yet
                    </li>
                  )}
                  <li>
                    <Link href="/proposals/new">
                      <div className="px-3 py-2 text-blue-400 hover:text-blue-300 text-sm">
                        + Create New Proposal
                      </div>
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          )}
        </nav>
        
        {!isCollapsed && (
          <div className="mt-auto pt-6 border-t border-gray-700 mt-8">
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Need Help?</h4>
              <p className="text-xs text-gray-400 mb-3">
                Check out our documentation or join the community Discord for assistance.
              </p>
              <Link href="https://docs.okto.xyz" target="_blank" rel="noopener noreferrer">
                <button className="w-full bg-gray-600 hover:bg-gray-500 text-white rounded-lg px-3 py-1.5 text-sm">
                  View Documentation
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}