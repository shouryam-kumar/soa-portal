'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Shield, 
  Award, 
  User, 
  FileText, 
  BarChart3,
  Settings,
  Users,
  Clock
} from 'lucide-react';
import type { Database } from '@/types/database.types';

export default function AdminLandingPage() {
  const [adminName, setAdminName] = useState('Admin');
  const supabase = createClientComponentClient<Database>();
  
  useEffect(() => {
    const fetchAdminProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setAdminName(profile.full_name || profile.username || 'Admin');
        }
      }
    };
    
    fetchAdminProfile();
  }, [supabase]);
  
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-blue-600 rounded-full h-10 w-10 flex items-center justify-center mr-3">
              <span className="font-bold text-white">O</span>
            </div>
            <h1 className="text-xl font-bold text-white">Okto Admin</h1>
          </div>
          
          <div className="text-white">Welcome, {adminName}</div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="bg-blue-600 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
            <Shield size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400 mb-4">Summer of Abstraction Program</p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Manage bounties, review proposals, and oversee user submissions for the Summer of Abstraction program.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link href="/admin/dashboard">
            <div className="bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-lg p-8 text-center transition-colors">
              <BarChart3 size={48} className="mx-auto mb-4 text-blue-500" />
              <h2 className="text-xl font-bold text-white mb-2">Dashboard</h2>
              <p className="text-gray-400">View key statistics and program overview</p>
            </div>
          </Link>
          
          <Link href="/admin/bounties">
            <div className="bg-gray-800 border border-gray-700 hover:border-purple-500 rounded-lg p-8 text-center transition-colors">
              <Award size={48} className="mx-auto mb-4 text-purple-500" />
              <h2 className="text-xl font-bold text-white mb-2">Bounties</h2>
              <p className="text-gray-400">Create and manage program bounties</p>
            </div>
          </Link>
          
          <Link href="/admin/proposals">
            <div className="bg-gray-800 border border-gray-700 hover:border-green-500 rounded-lg p-8 text-center transition-colors">
              <FileText size={48} className="mx-auto mb-4 text-green-500" />
              <h2 className="text-xl font-bold text-white mb-2">Proposals</h2>
              <p className="text-gray-400">Review and process user proposals</p>
            </div>
          </Link>
          
          <Link href="/admin/users">
            <div className="bg-gray-800 border border-gray-700 hover:border-yellow-500 rounded-lg p-8 text-center transition-colors">
              <Users size={48} className="mx-auto mb-4 text-yellow-500" />
              <h2 className="text-xl font-bold text-white mb-2">Users</h2>
              <p className="text-gray-400">Manage user accounts and permissions</p>
            </div>
          </Link>
          
          <Link href="/admin/submissions">
            <div className="bg-gray-800 border border-gray-700 hover:border-orange-500 rounded-lg p-8 text-center transition-colors">
              <Clock size={48} className="mx-auto mb-4 text-orange-500" />
              <h2 className="text-xl font-bold text-white mb-2">Submissions</h2>
              <p className="text-gray-400">Review and process user submissions</p>
            </div>
          </Link>
          
          <Link href="/admin/settings">
            <div className="bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg p-8 text-center transition-colors">
              <Settings size={48} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-bold text-white mb-2">Settings</h2>
              <p className="text-gray-400">Configure portal settings</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}