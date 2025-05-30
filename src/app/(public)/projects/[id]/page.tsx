import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Users, GitBranch, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch project data
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      proposals(id, title, status),
      profiles:leader_id(id, username, avatar_url),
      project_members(
        profiles:user_id(id, username, avatar_url)
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !project) {
    notFound();
  }

  // Fetch milestones for this project
  const { data: milestonesRaw } = await supabase
    .from('milestones')
    .select('*')
    .eq('proposal_id', project.proposal_id)
    .order('created_at', { ascending: true });
  const milestones = Array.isArray(milestonesRaw) ? milestonesRaw : [];

  // Progress bar: percent of verified milestones
  const totalMilestones = milestones.length;
  const verifiedMilestones = milestones.filter(m => m.verified).length;
  const progressPercent = totalMilestones > 0 ? Math.round((verifiedMilestones / totalMilestones) * 100) : 0;

  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Get project progress
  const getProjectProgress = (project: any) => {
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);
    const today = new Date();
    
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.min(Math.max(Math.floor((daysElapsed / totalDays) * 100), 0), 100);
  };

  // Find the correct proposal for this project
  const proposal = Array.isArray(project.proposals)
    ? project.proposals.find((p: any) => p.id === project.proposal_id)
    : project.proposals;

  const projectTitle = proposal?.title || 'Untitled Project';
  const projectDescription = proposal?.description || 'No description available';

  // Filter out the leader from the members list
  const members = (project.project_members || []).filter(
    (member: any) => member.profiles?.id !== project.profiles?.id
  );

  // Helper for milestone status
  const getMilestoneStatus = (milestone: any) => {
    if (milestone.completed) return 'Verified';
    if (milestone.feedback === 'verification_requested') return 'Verification Requested';
    if (milestone.completed === false) return 'Completed';
    return 'Pending';
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
      case 'completed': // Treat completed as approved for project badges
      case 'approved':
        return 'bg-green-900 text-green-300';
      case 'under_review':
        return 'bg-blue-700 text-blue-200';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto px-6 py-8">
        <Link href="/projects" className="text-blue-400 hover:text-blue-300 flex items-center mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Back to Projects
        </Link>

        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                
                <h1 className="text-2xl font-bold mt-4 mb-4">{projectTitle}</h1>
                <span className={`text-xs px-2 py-1 rounded-lg ${getStatusBadgeStyle(project.status)}`}>
                  {project.status === 'approved' ? 'Approved' : project.status === 'completed' ? 'Completed' : project.status === 'under_review' ? 'Under Review' : project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Unknown'}
                </span>
                <p className="text-gray-300 mb-6">{projectDescription}</p>

                <div className="flex flex-wrap gap-6 text-sm text-gray-400 mb-6">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Users size={16} className="mr-2" />
                    <span>{(project.project_members?.length || 0) + 1} Members</span>
                  </div>
                  
                  {project.repository && (
                    <div className="flex items-center">
                      <GitBranch size={16} className="mr-2" />
                      <a href={project.repository} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        Repository
                      </a>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-gray-400">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Milestones Section */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4">Milestones</h2>
                  <div className="space-y-4">
                    {milestones.length === 0 && (
                      <div className="text-gray-400">No milestones defined for this project.</div>
                    )}
                    {milestones.map((milestone: any) => (
                      <div key={milestone.id} className="bg-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="font-medium text-white">{milestone.title}</div>
                          <div className="text-gray-400 text-sm mb-2">{milestone.description}</div>
                          <div className="text-xs text-gray-500">Status: {getMilestoneStatus(milestone)}</div>
                        </div>
                        <div className="flex flex-col gap-2 md:items-end">
                          {/* Request Verification Button */}
                          {!milestone.completed && milestone.feedback !== 'verification_requested' && (
                            <form action="/api/milestones/request-verification" method="POST">
                              <input type="hidden" name="milestone_id" value={milestone.id} />
                              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Request Verification
                              </button>
                            </form>
                          )}
                          {milestone.feedback === 'verification_requested' && !milestone.completed && (
                            <span className="px-3 py-1 bg-yellow-700 text-yellow-200 rounded-full text-xs">Verification Requested</span>
                          )}
                          {milestone.completed && (
                            <span className="px-3 py-1 bg-green-700 text-green-200 rounded-full text-xs">Verified</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:w-64">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4">Team Members</h2>
                  
                  <div className="space-y-4">
                    {/* Project Leader */}
                    {project.profiles && (
                      <div key={`leader-${project.profiles.id}`} className="flex items-center">
                        {project.profiles.avatar_url ? (
                          <Image 
                            src={project.profiles.avatar_url} 
                            alt={project.profiles.username || 'Project Leader'}
                            width={40}
                            height={40}
                            className="rounded-full border-2 border-blue-500"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-2 border-blue-600">
                            <span className="text-white font-medium text-xs">
                              {project.profiles.username?.substring(0, 2).toUpperCase() || 'PL'}
                            </span>
                          </div>
                        )}
                        <div className="ml-3">
                          <p className="text-sm font-medium">{project.profiles.username || 'Project Leader'}</p>
                          <p className="text-xs text-gray-400">Leader</p>
                        </div>
                      </div>
                    )}

                    {/* Project Members */}
                    {members.map((member: any) => (
                      <div key={member.id} className="flex items-center">
                        {member.profiles?.avatar_url ? (
                          <Image 
                            src={member.profiles.avatar_url} 
                            alt={member.profiles.username || 'Team Member'}
                            width={40}
                            height={40}
                            className="rounded-full border-2 border-gray-600"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center border-2 border-gray-600">
                            <span className="text-white font-medium text-xs">
                              {member.profiles?.username?.substring(0, 2).toUpperCase() || 'TM'}
                            </span>
                          </div>
                        )}
                        <div className="ml-3">
                          <p className="text-sm font-medium">{member.profiles?.username || 'Team Member'}</p>
                          <p className="text-xs text-gray-400">Member</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 