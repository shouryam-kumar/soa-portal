'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { 
  LayoutDashboard, 
  FileText, 
  Award, 
  Rocket, 
  Lightbulb, 
  ChevronDown, 
  ChevronRight, 
  DollarSign,
  Plus,
  HelpCircle
} from 'lucide-react';

// Define types
interface Proposal {
  id: string;
  title: string;
  status: string | null;
}

interface SidebarProps {
  onWidthChange?: (isCollapsed: boolean) => void;
}

export default function Sidebar({ onWidthChange }: SidebarProps) {
  const pathname = usePathname();
  const { user, supabase } = useSupabase();
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [myProposalsExpanded, setMyProposalsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Check if current page is an admin page
  const isAdminPage = pathname?.startsWith('/admin');

  // Fetch proposals only once when user or supabase changes
  useEffect(() => {
    // Skip if no user or supabase, or if we're on admin page
    if (!user || !supabase || isAdminPage) {
      return;
    }

    const fetchMyProposals = async () => {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log("Sidebar user state:", user ? `User ID: ${user.id}` : "No user");
        console.log("Attempting to fetch proposals...");
        console.log(`Fetching proposals for user ID: ${user.id}`);
      }
      
      try {
        const { data, error } = await supabase
          .from('proposals')
          .select('id, title, status')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching proposals:', error);
          setFetchError(error.message);
          return;
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Found ${data?.length || 0} proposals for user:`, data);
        }
        
        if (data) {
          setMyProposals(data);
        }
      } catch (err) {
        console.error('Exception during proposal fetch:', err);
        setFetchError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    fetchMyProposals();
  }, [user?.id, supabase, isAdminPage]); // Depend on user.id instead of user object

  // Handle screen size separately
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []); // Empty dependency array - only run once

  // Don't render the sidebar on admin pages - but only after all hooks have been called
  if (isAdminPage) {
    return null;
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} className="text-blue-400" /> },
    { label: 'Proposals', path: '/proposals', icon: <FileText size={18} className="text-indigo-400" /> },
    { label: 'Bounties', path: '/bounties', icon: <Award size={18} className="text-purple-400" /> },
    { label: 'Active Projects', path: '/projects', icon: <Rocket size={18} className="text-pink-400" /> },
    { label: 'Idea Board', path: '/ideaboard', icon: <Lightbulb size={18} className="text-yellow-400" /> },
    { label: 'Rewards', path: '/rewards', icon: <DollarSign size={18} className="text-green-400" /> },
  ];

  // Get status color for proposal
  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-700/60 text-gray-300 border border-gray-600';
    
    switch(status) {
      case 'approved':
        return 'bg-green-900/60 text-green-300 border border-green-800';
      case 'rejected':
        return 'bg-red-900/60 text-red-300 border border-red-800';
      case 'submitted':
        return 'bg-yellow-900/60 text-yellow-300 border border-yellow-800';
      case 'draft':
        return 'bg-gray-700/60 text-gray-300 border border-gray-600';
      default:
        return 'bg-gray-700/60 text-gray-300 border border-gray-600';
    }
  };

  // Don't render the sidebar on mobile if no user
  if (isMobile && !user) {
    return null;
  }

  const toggleMyProposals = () => {
    setMyProposalsExpanded(!myProposalsExpanded);
  };

  return (
    <div className="fixed top-16 left-0 bottom-0 bg-gray-800/95 backdrop-blur-sm border-r border-gray-700/50 w-64 z-40 overflow-hidden">
      <div className="h-full flex flex-col p-2 overflow-y-auto">
        <nav className="flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path} className="px-2">
                <Link href={item.path}>
                  <div
                    className={`w-full text-left px-3 py-3 rounded-xl flex items-center transition-all duration-200 ${
                      pathname === item.path
                        ? 'bg-gray-700/80 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-700/40'
                    }`}
                  >
                    <span className={`flex-shrink-0 ${pathname === item.path ? 'animate-pulse' : ''}`}>
                      {item.icon}
                    </span>
                    <span className={`ml-3 ${pathname === item.path ? 'font-medium' : ''}`}>
                      {item.label}
                    </span>
                    {pathname === item.path && (
                      <div className="ml-auto w-1.5 h-6 bg-gradient-to-b from-blue-400 to-indigo-600 rounded-full" />
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          
          {user && (
            <div className="mt-8 px-3">
              <div
                onClick={toggleMyProposals}
                className="flex items-center justify-between px-3 py-2 cursor-pointer bg-gray-750/30 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
              >
                <h3 className="text-sm font-medium text-gray-300">
                  My Proposals {myProposals.length > 0 && `(${myProposals.length})`}
                </h3>
                <button className="text-gray-400 hover:text-gray-200 transition-colors">
                  {myProposalsExpanded ? 
                    <ChevronDown size={16} /> : 
                    <ChevronRight size={16} />
                  }
                </button>
              </div>
              
              {myProposalsExpanded && (
                <div className="overflow-hidden">
                  <ul className="mt-2 space-y-1 pl-2">
                    {fetchError && (
                      <li className="px-3 py-2 text-sm text-red-400">
                        Error: {fetchError}
                      </li>
                    )}
                    
                    {!fetchError && myProposals.length > 0 ? (
                      myProposals.map((proposal) => (
                        <li key={proposal.id}>
                          <Link href={`/proposals/${proposal.id}`}>
                            <div 
                              className={`block py-2 px-3 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white text-sm flex items-center ${pathname === `/proposals/${proposal.id}` ? 'bg-gray-700/30' : ''}`}
                            >
                              <span className="flex-1 truncate">{proposal.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(proposal.status)}`}>
                                {proposal.status || 'draft'}
                              </span>
                            </div>
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-sm text-gray-400">
                        {!fetchError ? 'No proposals yet' : ''}
                      </li>
                    )}
                    <li>
                      <Link href="/proposals/new">
                        <div className="px-3 py-2 text-blue-400 hover:text-blue-300 text-sm flex items-center">
                          <Plus size={14} className="mr-2" />
                          Create New Proposal
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-gray-700/50 mt-4 px-3">
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl p-4 border border-gray-700/50">
            <h4 className="text-sm font-semibold mb-2 flex items-center text-gray-200">
              <HelpCircle size={14} className="mr-1.5 text-blue-400" />
              Need Help?
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Check out our documentation or join the community Discord for assistance.
            </p>
            <Link href="https://docs.okto.tech" target="_blank" rel="noopener noreferrer">
              <button className="w-full bg-blue-600/70 hover:bg-blue-600 text-white rounded-lg px-3 py-1.5 text-sm flex items-center justify-center transition-colors duration-200">
                View Documentation
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}