'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Award, CheckCircle, ChevronDown, ChevronUp, Clock, UserCircle } from 'lucide-react';
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
        return 'bg-green-900/60 text-green-300 border border-green-700/50';
      case 'submitted':
        return 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/50';
      case 'rejected':
        return 'bg-red-900/60 text-red-300 border border-red-700/50';
      case 'completed':
        return 'bg-blue-900/60 text-blue-300 border border-blue-700/50';
      case 'under_review':
        return 'bg-blue-700/60 text-blue-200 border border-blue-400/50';
      default:
        return 'bg-gray-700/60 text-gray-300 border border-gray-600/50';
    }
  };

  // Determine type badge style
  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-blue-900/60 text-blue-300 border border-blue-700/50';
      case 'bounty':
        return 'bg-purple-900/60 text-purple-300 border border-purple-700/50';
      default:
        return 'bg-gray-700/60 text-gray-300 border border-gray-600/50';
    }
  };

  // Generate initials from username
  const getInitials = (username: string | null) => {
    if (!username) return 'UN';
    return username.substring(0, 2).toUpperCase();
  };

  // Get background color for avatar
  const getAvatarColor = (username: string | null) => {
    if (!username) return 'bg-gray-600';
    const colors = [
      'bg-gradient-to-br from-red-500 to-red-600', 
      'bg-gradient-to-br from-blue-500 to-blue-600', 
      'bg-gradient-to-br from-green-500 to-green-600', 
      'bg-gradient-to-br from-yellow-500 to-yellow-600', 
      'bg-gradient-to-br from-purple-500 to-purple-600', 
      'bg-gradient-to-br from-pink-500 to-pink-600'
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`bg-gradient-to-b from-gray-800 to-gray-800/80 border border-gray-700 hover:border-blue-500/50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${detailed ? 'border-l-4 border-l-blue-500' : ''}`}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-5">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getTypeBadgeStyle(proposal.type)}`}>
                {proposal.type.charAt(0).toUpperCase() + proposal.type.slice(1)}
              </span>
              {proposal.status && (
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getStatusBadgeStyle(proposal.status)}`}>
                  {proposal.status === 'under_review' ? 'Under Review' : proposal.status ? proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) : 'Unknown'}
                </span>
              )}
              {proposal.fields && proposal.fields.length > 0 && (
                <span className="bg-gray-700/60 text-gray-300 text-xs px-3 py-1.5 rounded-full border border-gray-600/50">
                  {proposal.fields[0]}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white tracking-tight">{proposal.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {expanded ? proposal.description : proposal.short_description}
            </p>
          </div>
          <div className="flex items-center text-gray-400 text-sm bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/70 shadow-sm">
            <Calendar size={16} className="mr-2 text-blue-400" />
            <span>{formatDate(proposal.created_at)}</span>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-6 space-y-6">
            {proposal.skills_required && proposal.skills_required.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 text-gray-200 uppercase tracking-wider">Skills Required</h4>
                <div className="flex flex-wrap gap-2">
                  {proposal.skills_required.map((skill, index) => (
                    <span key={index} className="bg-gray-700/60 text-gray-300 text-xs px-3 py-1.5 rounded-full border border-gray-600/50">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {proposal.milestones && proposal.milestones.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 text-gray-200 uppercase tracking-wider">Milestones</h4>
                <div className="space-y-3">
                  {proposal.milestones.map((milestone) => (
                    <div key={milestone.id} className="bg-gray-750/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/70 hover:border-gray-600 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${milestone.completed ? 'bg-green-500' : 'bg-gray-600/80'}`}>
                            {milestone.completed && <CheckCircle size={14} className="text-gray-900" />}
                          </div>
                          <span className="font-medium text-white">{milestone.title}</span>
                        </div>
                        <span className="text-sm bg-blue-900/30 text-blue-300 px-2 py-1 rounded-md font-medium border border-blue-700/30">
                          {milestone.points_allocated} OKTO
                        </span>
                      </div>
                      <div className="flex items-center mt-2 text-gray-400 text-sm pl-8">
                        <Clock size={14} className="mr-1.5 text-gray-500" />
                        <span>Due: {formatDate(milestone.deadline)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 pt-5 border-t border-gray-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-4">
            <div className="flex items-center gap-2">
              {proposal.profiles?.avatar_url ? (
                <Image 
                  src={proposal.profiles.avatar_url} 
                  alt={proposal.profiles.username || 'User'}
                  width={36}
                  height={36}
                  className="rounded-full border border-gray-600 shadow-sm"
                />
              ) : (
                <div className={`w-9 h-9 ${getAvatarColor(proposal.profiles ? proposal.profiles.username : null)} rounded-full flex items-center justify-center border border-gray-600/50 shadow-sm`}>
                  <span className="text-white font-medium text-xs">
                    {getInitials(proposal.profiles ? proposal.profiles.username : null)}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-white">{proposal.profiles?.username || 'Unknown User'}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center text-gray-400">
                <Award size={16} className="mr-1.5 text-yellow-400" />
                <span className="text-sm font-medium text-blue-300">{proposal.total_points} OKTO</span>
              </div>
              
              {totalMilestones > 0 && (
                <div className="flex items-center text-gray-400">
                  <CheckCircle size={16} className="mr-1.5 text-green-400" />
                  <span className="text-sm">{completedMilestones}/{totalMilestones}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              className="text-gray-400 hover:text-white bg-gray-750/70 hover:bg-gray-700 p-2 rounded-lg transition-colors border border-gray-700/70 hover:border-gray-600"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <Link href={`/proposals/${proposal.id}`} className="flex-1 sm:flex-none">
              <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-sm">
                View Details
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {totalMilestones > 0 && (
        <div className="bg-gray-850/80 backdrop-blur-sm px-6 py-4 border-t border-gray-700/70">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400 font-medium">Progress</span>
            <span className="text-gray-300">
              <span className="text-blue-400 font-medium">{Math.round(progressPercentage)}%</span>
              &nbsp;({completedMilestones} of {totalMilestones})
            </span>
          </div>
          <div className="w-full bg-gray-700/70 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-400 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}