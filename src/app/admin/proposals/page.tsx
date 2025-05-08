'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Database } from '@/types/database.types';

// Dynamically import AdminHeader
const AdminHeader = dynamic(() => import('@/components/admin/AdminHeader'), { 
  ssr: false 
});

// Define proposal type
interface Proposal {
  id: string;
  title: string;
  creator: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  bounty_amount?: number;
}

export default function AdminProposalsPage() {
  const supabase = createClientComponentClient<Database>();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would fetch from Supabase
        // For now, we'll use mock data
        setTimeout(() => {
          const mockProposals = [
            {
              id: 'p1',
              title: 'ZeroPass: Cross-Chain KYC-Free Web3 Passport',
              creator: 'Alex Johnson',
              created_at: '2023-07-11T14:32:00Z',
              status: 'pending',
              category: 'Identity',
              bounty_amount: 5000
            },
            {
              id: 'p2',
              title: 'OKTO SDK Integration for Minecraft',
              creator: 'Sarah Miller',
              created_at: '2023-07-10T09:15:00Z',
              status: 'approved',
              category: 'Gaming',
              bounty_amount: 3500
            },
            {
              id: 'p3',
              title: 'Decentralized Oracle for Real-World Data',
              creator: 'Mark Williams',
              created_at: '2023-07-08T16:45:00Z',
              status: 'rejected',
              category: 'Infrastructure',
              bounty_amount: 7500
            },
            {
              id: 'p4',
              title: 'NFT Marketplace Integration',
              creator: 'Jamie Lee',
              created_at: '2023-07-05T11:23:00Z',
              status: 'approved',
              category: 'NFTs',
              bounty_amount: 4000
            },
            {
              id: 'p5',
              title: 'Cross-Chain Message Protocol',
              creator: 'Taylor Chen',
              created_at: '2023-07-03T13:54:00Z',
              status: 'pending',
              category: 'Infrastructure',
              bounty_amount: 6500
            },
            {
              id: 'p6',
              title: 'DeFi Lending Protocol',
              creator: 'Jordan Smith',
              created_at: '2023-06-29T10:18:00Z',
              status: 'approved',
              category: 'DeFi',
              bounty_amount: 8000
            }
          ] as Proposal[];
          
          setProposals(mockProposals);
          setLoading(false);
        }, 800);
        
      } catch (error) {
        console.error('Error fetching proposals:', error);
        setLoading(false);
      }
    };

    fetchProposals();
  }, [supabase]);

  // Filter proposals based on search and status
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || proposal.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort proposals
  const sortedProposals = [...filteredProposals].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'title') {
      return sortDirection === 'asc' 
        ? a.title.localeCompare(b.title) 
        : b.title.localeCompare(a.title);
    } else if (sortBy === 'bounty') {
      const amountA = a.bounty_amount || 0;
      const amountB = b.bounty_amount || 0;
      return sortDirection === 'asc' ? amountA - amountB : amountB - amountA;
    }
    return 0;
  });

  // Helper function for status badge
  const getStatusBadge = (status: Proposal['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" /> Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" /> Pending
          </span>
        );
    }
  };

  // Helper function for sorting headers
  const renderSortableHeader = (label: string, value: string) => {
    const isActive = sortBy === value;
    return (
      <button 
        className={`flex items-center ${isActive ? 'text-blue-400' : 'text-gray-400'}`}
        onClick={() => {
          if (isActive) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy(value);
            setSortDirection('desc');
          }
        }}
      >
        {label}
        {isActive && (
          sortDirection === 'asc' ? (
            <ChevronUp size={14} className="ml-1" />
          ) : (
            <ChevronDown size={14} className="ml-1" />
          )
        )}
      </button>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminHeader title="Proposals Management" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Proposals</h1>
            <p className="text-gray-400">Review and manage project proposals</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm flex items-center">
              <Download size={14} className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search proposals..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-700 text-white placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={16} className="text-gray-400" />
              </div>
              <select
                className="block pl-10 pr-8 py-2 border border-gray-700 rounded-lg bg-gray-700 text-white"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Proposals Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md">
          {loading ? (
            <div className="py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-center text-gray-400 mt-4">Loading proposals...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-750">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {renderSortableHeader('Title', 'title')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Submitted By
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {renderSortableHeader('Date', 'date')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {renderSortableHeader('Bounty', 'bounty')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {sortedProposals.length > 0 ? (
                      sortedProposals.map((proposal) => (
                        <tr key={proposal.id} className="hover:bg-gray-750">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{proposal.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{proposal.creator}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{formatDate(proposal.created_at)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{proposal.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {proposal.bounty_amount ? `$${proposal.bounty_amount.toLocaleString()}` : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(proposal.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link href={`/admin/proposals/${proposal.id}`} className="text-blue-400 hover:text-blue-300 mr-4">
                              View
                            </Link>
                            {proposal.status === 'pending' && (
                              <>
                                <button className="text-green-400 hover:text-green-300 mr-4">
                                  Approve
                                </button>
                                <button className="text-red-400 hover:text-red-300">
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                          No proposals match your search criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-gray-750 px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      Showing <span className="font-medium">{sortedProposals.length}</span> of{' '}
                      <span className="font-medium">{proposals.length}</span> proposals
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
                      >
                        Previous
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-blue-600 text-sm font-medium text-white"
                      >
                        1
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
                      >
                        2
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700"
                      >
                        Next
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 