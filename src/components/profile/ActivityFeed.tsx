// src/components/profile/ActivityFeed.tsx
'use client';

import Link from 'next/link';
import { format, parseISO } from 'date-fns';

// Update interface to better match your actual data
interface ActivityItem {
  id: string;
  title: string;
  status: string; // Now non-nullable
  created_at: string; // Now non-nullable
}

interface ActivityFeedProps {
  proposals: ActivityItem[];
  bounties: any[]; // Use any[] since we're not sure of the structure
}

export default function ActivityFeed({ 
  proposals, 
  bounties 
}: ActivityFeedProps) {
  // Combine proposals and bounties into a single array
  const allActivities = [
    ...proposals.map(item => ({ 
      ...item, 
      type: 'proposal' 
    })),
    ...bounties.map(item => ({ 
      ...item, 
      type: 'bounty',
      // Ensure required properties exist
      id: item.id || '',
      title: item.title || 'Untitled Bounty',
      status: item.status || 'unknown',
      created_at: item.created_at || new Date().toISOString()
    }))
  ]
  // Sort by created_at, newest first
  .sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  // Limit to 10 items
  .slice(0, 10);
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-900/60 text-green-200 border-green-800';
      case 'pending':
        return 'bg-yellow-900/60 text-yellow-200 border-yellow-800';
      case 'rejected':
        return 'bg-red-900/60 text-red-200 border-red-800';
      case 'open':
        return 'bg-blue-900/60 text-blue-200 border-blue-800';
      case 'closed':
        return 'bg-gray-700/60 text-gray-300 border-gray-600';
      default:
        return 'bg-gray-700/60 text-gray-300 border-gray-600';
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-6 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Recent Activity
      </h3>
      
      {allActivities.length > 0 ? (
        <div className="space-y-4">
          {allActivities.map((activity, index) => (
            <div 
              key={`${activity.type}-${activity.id}-${index}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-gray-750 border border-gray-700 hover:bg-gray-700/70 transition"
            >
              <div className="flex items-start sm:items-center mb-3 sm:mb-0">
                <div className={`
                  p-2 rounded-lg mr-3
                  ${activity.type === 'proposal' ? 'bg-blue-900/30' : 'bg-purple-900/30'}
                `}>
                  {activity.type === 'proposal' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium">
                    <Link 
                      href={`/${activity.type === 'proposal' ? 'proposals' : 'bounties'}/${activity.id}`}
                      className="text-white hover:text-blue-300 transition"
                    >
                      {activity.title}
                    </Link>
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 capitalize">
                      {activity.type}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-xs text-gray-400">
                      {format(parseISO(activity.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="ml-11 sm:ml-0">
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium border
                  ${getStatusColor(activity.status)}
                `}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex rounded-full bg-gray-700/30 p-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-400 mb-1">No activity found</p>
          <p className="text-sm text-gray-500">Start creating proposals or bounties to see your activity here.</p>
        </div>
      )}
    </div>
  );
}