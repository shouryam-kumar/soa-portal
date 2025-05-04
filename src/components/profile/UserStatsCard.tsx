// src/components/profile/UserStatsCard.tsx
'use client';

import { format } from 'date-fns';

interface UserStatsCardProps {
  proposalsCount: number;
  bountiesCount: number;
  joinDate?: string; // Make joinDate optional
}

export default function UserStatsCard({ 
  proposalsCount, 
  bountiesCount, 
  joinDate 
}: UserStatsCardProps) {
  const stats = [
    {
      name: 'Proposals',
      value: proposalsCount,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Bounties',
      value: bountiesCount,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];
  
  return (
    <div className="border border-gray-700 rounded-xl bg-gray-900/50 p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Stats & Activity</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="flex justify-center mb-1">
              {stat.icon}
            </div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.name}</div>
          </div>
        ))}
      </div>
      
      {joinDate && (
        <div className="flex items-center justify-center text-sm text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Joined {format(new Date(joinDate), 'MMMM yyyy')}
        </div>
      )}
    </div>
  );
}