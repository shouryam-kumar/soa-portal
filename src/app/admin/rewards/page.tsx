'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Award, Gift, DollarSign, Medal } from 'lucide-react';

// Dynamically import AdminHeader
const AdminHeader = dynamic(() => import('@/components/admin/AdminHeader'), { 
  ssr: false 
});

export default function AdminRewardsPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <AdminHeader title="Rewards Management" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Rewards</h1>
            <p className="text-gray-400">Manage program rewards and incentives</p>
          </div>
        </div>
        
        {/* Coming Soon Message */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <Award size={48} className="text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Rewards Management Coming Soon</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6">
            The rewards management system is currently under development. Soon you'll be able to manage bounties, distribute rewards, and track incentive programs.
          </p>
          
          {/* Placeholder Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
            <div className="bg-gray-750 p-4 rounded-lg text-center">
              <DollarSign className="text-green-500 mx-auto mb-2" size={24} />
              <h3 className="text-white font-medium">Bounty Management</h3>
            </div>
            <div className="bg-gray-750 p-4 rounded-lg text-center">
              <Gift className="text-blue-500 mx-auto mb-2" size={24} />
              <h3 className="text-white font-medium">Reward Distribution</h3>
            </div>
            <div className="bg-gray-750 p-4 rounded-lg text-center">
              <Medal className="text-purple-500 mx-auto mb-2" size={24} />
              <h3 className="text-white font-medium">Achievement Badges</h3>
            </div>
            <div className="bg-gray-750 p-4 rounded-lg text-center">
              <Award className="text-yellow-500 mx-auto mb-2" size={24} />
              <h3 className="text-white font-medium">Leaderboards</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 