'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, Shield, Mail, Clock, Award, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  is_admin: boolean;
  verified: boolean;
  okto_points: number;
  created_at: string;
  last_sign_in: string | null;
  email_verified: boolean;
}

interface SupabaseUser {
  id: string;
  username: string;
  avatar_url: string | null;
  is_admin: boolean;
  verified: boolean;
  okto_points: number;
  created_at: string;
  auth_users: {
    email: string;
    email_confirmed_at: string | null;
    last_sign_in_at: string | null;
  };
}

interface ProfileRecord {
  id: string;
  [key: string]: any;
}

interface AdminUsersClientProps {
  initialUsers: UserProfile[];
}

export default function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'unverified'>('all');
  const supabase = createClientComponentClient();
  
  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        async (payload: RealtimePostgresChangesPayload<ProfileRecord>) => {
          const record = payload.new || payload.old;
          if (!record?.id) return;
          
          // Fetch updated user data
          const { data: updatedUser, error } = await supabase
            .from('profiles')
            .select(`
              *,
              auth_users:auth.users!inner(
                email,
                email_confirmed_at,
                last_sign_in_at
              )
            `)
            .eq('id', record.id)
            .single();
            
          if (error || !updatedUser) {
            console.error('Error fetching updated user:', error);
            return;
          }
          
          const user = updatedUser as unknown as SupabaseUser;
          setUsers(currentUsers => {
            const transformedUser: UserProfile = {
              id: user.id,
              username: user.username,
              email: user.auth_users?.email,
              avatar_url: user.avatar_url,
              is_admin: user.is_admin,
              verified: user.verified,
              okto_points: user.okto_points,
              created_at: user.created_at,
              last_sign_in: user.auth_users?.last_sign_in_at,
              email_verified: !!user.auth_users?.email_confirmed_at
            };
            
            if (payload.eventType === 'DELETE') {
              return currentUsers.filter(u => u.id !== record.id);
            }
            
            return currentUsers.map(u => 
              u.id === user.id ? transformedUser : u
            );
          });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);
  
  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'admin' && user.is_admin) ||
      (filter === 'unverified' && !user.verified);
      
    return matchesSearch && matchesFilter;
  });
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Toggle admin status
  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling admin status:', error);
    }
  };
  
  // Toggle verification status
  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified: !currentStatus })
        .eq('id', userId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling verification status:', error);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Filters and Search */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setFilter('admin')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'admin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Admins
            </button>
            <button
              onClick={() => setFilter('unverified')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'unverified'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Unverified
            </button>
          </div>
        </div>
      </div>
      
      {/* Users List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700/50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Points</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Sign In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-700/30">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <User size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{user.username}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <Shield size={16} className={`mr-2 ${user.is_admin ? 'text-blue-400' : 'text-gray-400'}`} />
                      <span className="text-sm">{user.is_admin ? 'Admin' : 'User'}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail size={16} className={`mr-2 ${user.email_verified ? 'text-green-400' : 'text-gray-400'}`} />
                      <span className="text-sm">{user.email_verified ? 'Verified' : 'Unverified'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Award size={16} className="mr-2 text-yellow-400" />
                    <span className="text-sm">{user.okto_points}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-gray-400" />
                    <span className="text-sm">{formatDate(user.created_at)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-gray-400" />
                    <span className="text-sm">{formatDate(user.last_sign_in)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAdmin(user.id, user.is_admin)}
                      className={`p-2 rounded-lg ${
                        user.is_admin
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      title={user.is_admin ? 'Remove Admin' : 'Make Admin'}
                    >
                      <Shield size={16} className="text-white" />
                    </button>
                    <button
                      onClick={() => toggleVerification(user.id, user.verified)}
                      className={`p-2 rounded-lg ${
                        user.verified
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                      title={user.verified ? 'Unverify User' : 'Verify User'}
                    >
                      {user.verified ? (
                        <XCircle size={16} className="text-white" />
                      ) : (
                        <CheckCircle size={16} className="text-white" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No users found matching your criteria</p>
        </div>
      )}
    </div>
  );
} 