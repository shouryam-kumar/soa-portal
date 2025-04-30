'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Award, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { Database } from '@/types/database.types';

type Proposal = Database['public']['Tables']['proposals']['Row'] & {
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  milestones: Database['public']['Tables']['milestones']['Row'][];
};

interface ProposalCardProps {
  proposal: Proposal;
  detailed?: boolean;
}

export default function ProposalCard({ proposal, detailed = false }: ProposalCardProps) {
  const [expanded, setExpanded] = useState(detailed);
  
  // Calculate milestone completion
  const totalMilestones = proposal.milestones?.length || 0;
  const completedMilestones = proposal.milestones?.filter(m => m.completed).length || 0;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  // Format the date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Determine status badge style
  const getStatusBadgeStyle = (status: string | null) => {
    switch (status) {
      case 'approved':
        return 'bg-green-900 text-green-300';
      case 'submitted':
        return 'bg-yellow-900 text-yellow-300';
      case 'rejected':
        return 'bg-red-900 text-red-300';
      case 'completed':
        return 'bg-blue-900 text-blue-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Determine type badge style
  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-blue-900 text-blue-300';
      case 'bounty':
        return 'bg-purple-900 text-purple-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Generate initials from username
  const getInitials = (username: string | null) => {
    if (!username) return 'UN';
    return username.substring(0, 2).toUpperCase();
  };

  // Get background color for avatar
  const getAvatarColor = (username: string | null) => {
    if (!username) return 'bg-gray-500';
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg overflow-hidden ${detailed ? 'border-l-4 border-l-blue-500' : ''}`}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded ${getTypeBadgeStyle(proposal.type)}`}>
                {proposal.type.charAt(0).toUpperCase() + proposal.type.slice(1)}
              </span>
              {proposal.status && (
                <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeStyle(proposal.status)}`}>
                  {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                </span>
              )}
              {proposal.fields && proposal.fields.length > 0 && (
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                  {proposal.fields[0]}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">{proposal.title}</h3>
            <p className="text-gray-400 text-sm">
              {expanded ? proposal.description : proposal.short_description}
            </p>
          </div>
          <div className="flex items-center text-gray-400 text-sm">
            <Calendar size={16} className="mr-1" />
            <span>{formatDate(proposal.created_at)}</span>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-4">
            {proposal.skills_required && proposal.skills_required.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Skills Required</h4>
                <div className="flex flex-wrap gap-2">
                  {proposal.skills_required.map((skill, index) => (
                    <span key={index} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {proposal.milestones && proposal.milestones.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Milestones</h4>
                <div className="space-y-2">
                  {proposal.milestones.map((milestone) => (
                    <div key={milestone.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-2 ${milestone.completed ? 'bg-green-500' : 'bg-gray-600'}`}>
                            {milestone.completed && <CheckCircle size={16} className="text-gray-800" />}
                          </div>
                          <span className="font-medium">{milestone.title}</span>
                        </div>
                        <span className="text-sm text-gray-400">{milestone.points_allocated} OKTO POINTS</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">Due: {formatDate(milestone.deadline)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {proposal.profiles?.avatar_url ? (
                <Image 
                  src={proposal.profiles.avatar_url} 
                  alt={proposal.profiles.username || 'User'}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className={`w-8 h-8 ${getAvatarColor(proposal.profiles ? proposal.profiles.username : null)} rounded-full flex items-center justify-center`}>
                  <span className="text-white font-medium text-xs">
                    {getInitials(proposal.profiles ? proposal.profiles.username : null)}
                  </span>
                </div>
              )}
              <span className="text-sm">{proposal.profiles?.username || 'Unknown User'}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-400">
              <Award size={16} />
              <span className="text-sm">{proposal.total_points} OKTO POINTS</span>
            </div>
            
            {totalMilestones > 0 && (
              <div className="flex items-center space-x-2 text-gray-400">
                <CheckCircle size={16} />
                <span className="text-sm">{completedMilestones} of {totalMilestones} Milestones</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="text-gray-400 hover:text-white"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <Link href={`/proposals/${proposal.id}`}>
              <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm">
                View Details
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {totalMilestones > 0 && (
        <div className="bg-gray-900 px-6 py-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Progress</span>
            <span className="text-gray-400">{completedMilestones} of {totalMilestones} milestones completed</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}