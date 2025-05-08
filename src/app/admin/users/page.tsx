'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Mail,
  UserCheck,
  Shield,
  UserX,
  User
} from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Database } from '@/types/database.types';

// Dynamically import AdminHeader
const AdminHeader = dynamic(() => import('@/components/admin/AdminHeader'), { 
  ssr: false 
});

// Define user type
interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  is_admin: boolean;
  verified: boolean;
  created_at: string;
  last_sign_in?: string;
}

export default function AdminUsersPage() {
  const supabase = createClientComponentClient<Database>();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would fetch from Supabase
        // For now, we'll use mock data
        setTimeout(() => {
          const mockUsers = [
            {
              id: 'u1',
              username: 'alexj',
              email: 'alex.johnson@example.com',
              full_name: 'Alex Johnson',
              avatar_url: 'https://i.pravatar.cc/150?u=1',
              is_admin: false,
              verified: true,
              created_at: '2023-06-12T10:30:00Z',
              last_sign_in: '2023-07-11T14:20:00Z'
            },
            {
              id: 'u2',
              username: 'sarahmiller',
              email: 'sarah.miller@example.com',
              full_name: 'Sarah Miller',
              avatar_url: 'https://i.pravatar.cc/150?u=2',
              is_admin: true,
              verified: true,
              created_at: '2023-05-05T08:45:00Z',
              last_sign_in: '2023-07-11T09:15:00Z'
            },
            {
              id: 'u3',
              username: 'markw',
              email: 'mark.williams@example.com',
              full_name: 'Mark Williams',
              avatar_url: 'https://i.pravatar.cc/150?u=3',
              is_admin: false,
              verified: true,
              created_at: '2023-06-18T15:20:00Z',
              last_sign_in: '2023-07-10T16:30:00Z'
            },
            {
              id: 'u4',
              username: 'jamielee',
              email: 'jamie.lee@example.com',
              full_name: 'Jamie Lee',
              avatar_url: 'https://i.pravatar.cc/150?u=4',
              is_admin: false,
              verified: false,
              created_at: '2023-07-02T11:10:00Z',
              last_sign_in: '2023-07-05T12:40:00Z'
            },
            {
              id: 'u5',
              username: 'taylorchen',
              email: 'taylor.chen@example.com',
              full_name: 'Taylor Chen',
              avatar_url: 'https://i.pravatar.cc/150?u=5',
              is_admin: false,
              verified: true,
              created_at: '2023-06-25T09:30:00Z',
              last_sign_in: '2023-07-08T18:15:00Z'
            },
            {
              id: 'u6',
              username: 'jordans',
              email: 'jordan.smith@example.com',
              full_name: 'Jordan Smith',
              avatar_url: 'https://i.pravatar.cc/150?u=6',
              is_admin: false,
              verified: true,
              created_at: '2023-05-17T13:25:00Z',
              last_sign_in: '2023-07-09T10:05:00Z'
            }
          ] as UserProfile[];
          
          setUsers(mockUsers);
          setLoading(false);
        }, 800);
        
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [supabase]);

  // Filter users based on search and filter type
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'admin') return matchesSearch && user.is_admin;
    if (filterType === 'non-admin') return matchesSearch && !user.is_admin;
    if (filterType === 'verified') return matchesSearch && user.verified;
    if (filterType === 'unverified') return matchesSearch && !user.verified;
    
    return matchesSearch;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valueA, valueB;
    
    if (sortBy === 'username') {
      valueA = a.username.toLowerCase();
      valueB = b.username.toLowerCase();
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    } 
    else if (sortBy === 'name') {
      valueA = a.full_name.toLowerCase();
      valueB = b.full_name.toLowerCase();
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    else if (sortBy === 'email') {
      valueA = a.email.toLowerCase();
      valueB = b.email.toLowerCase();
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    else if (sortBy === 'created_at') {
      valueA = new Date(a.created_at).getTime();
      valueB = new Date(b.created_at).getTime();
      return sortDirection === 'asc' 
        ? valueA - valueB
        : valueB - valueA;
    }
    else if (sortBy === 'last_sign_in') {
      valueA = a.last_sign_in ? new Date(a.last_sign_in).getTime() : 0;
      valueB = b.last_sign_in ? new Date(b.last_sign_in).getTime() : 0;
      return sortDirection === 'asc' 
        ? valueA - valueB
        : valueB - valueA;
    }
    
    return 0;
  });

  // Helper function for sortable headers
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
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Make admin toggle
  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    // In a real app, this would update the user in the database
    // For this demo, we'll just update the local state
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !isCurrentlyAdmin }
          : user
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <AdminHeader title="User Management" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Users</h1>
            <p className="text-gray-400">Manage users and access permissions</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm flex items-center">
              <Mail size={14} className="mr-2" />
              Send Mass Email
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
              placeholder="Search users by name, email, or username..."
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="admin">Admins Only</option>
                <option value="non-admin">Non-Admins</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md">
          {loading ? (
            <div className="py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-center text-gray-400 mt-4">Loading users...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-750">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {renderSortableHeader('Email', 'email')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {renderSortableHeader('Joined', 'created_at')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {renderSortableHeader('Last Sign In', 'last_sign_in')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {sortedUsers.length > 0 ? (
                      sortedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-750">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {user.avatar_url ? (
                                  <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt={user.full_name} />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                                    <User size={20} className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">{user.full_name}</div>
                                <div className="text-sm text-gray-400">@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              {user.is_admin && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <Shield size={12} className="mr-1" /> Admin
                                </span>
                              )}
                              {user.verified ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <UserCheck size={12} className="mr-1" /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <UserX size={12} className="mr-1" /> Unverified
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{formatDate(user.created_at)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{formatDate(user.last_sign_in)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                              className={`mr-4 ${user.is_admin ? 'text-red-400 hover:text-red-300' : 'text-blue-400 hover:text-blue-300'}`}
                            >
                              {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                            </button>
                            <button className="text-gray-400 hover:text-gray-300">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                          No users match your search criteria
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
                      Showing <span className="font-medium">{sortedUsers.length}</span> of{' '}
                      <span className="font-medium">{users.length}</span> users
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