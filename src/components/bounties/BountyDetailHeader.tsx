import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';

interface BountyDetailHeaderProps {
  bounty: {
    id: string;
    title: string;
    short_description: string;
    total_points: number;
    deadline?: string | null;
    profiles?: {
      username: string;
      avatar_url?: string | null;
    } | null;
  };
}

export default function BountyDetailHeader({ bounty }: BountyDetailHeaderProps) {
  const deadlineDate = bounty.deadline ? new Date(bounty.deadline) : null;
  const isDeadlineSoon = deadlineDate && 
    (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 3; // Less than 3 days
  
  return (
    <div className="mb-8">
      <Link 
        href="/bounties" 
        className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Bounties
      </Link>
      
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <span className="bg-purple-900 text-purple-300 text-xs px-2 py-1 rounded-lg mb-2 inline-block">
              Bounty
            </span>
            
            {deadlineDate && (
              <span className={`ml-2 text-xs px-2 py-1 rounded-lg inline-flex items-center
                ${isDeadlineSoon 
                  ? 'bg-red-900 text-red-300' 
                  : 'bg-gray-700 text-gray-300'
                }`}
              >
                <Calendar size={12} className="mr-1" />
                Due: {deadlineDate.toLocaleDateString()}
                {isDeadlineSoon && " (Soon)"}
              </span>
            )}
            
            <h1 className="text-2xl font-bold mt-2">{bounty.title}</h1>
            <p className="text-gray-400 mt-2">{bounty.short_description}</p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 text-center md:text-right">
            <div className="text-sm text-gray-400 mb-1">Reward</div>
            <div className="text-3xl font-bold text-purple-400">{bounty.total_points}</div>
            <div className="text-sm text-purple-300">points</div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Posted by Okto Team
            </div>
            
            <Link href={`/bounties/${bounty.id}`}>
              <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm">
                View Full Details
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}