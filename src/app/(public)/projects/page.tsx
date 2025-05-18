import Link from 'next/link';
import Image from 'next/image';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Calendar, Users, GitBranch } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch active projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      proposals(*),
      profiles:leader_id(id, username, avatar_url),
      project_members(
        profiles:user_id(id, username, avatar_url)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
  }

  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Get project progress
  const getProjectProgress = (project: any) => {
    // Calculate days elapsed since start
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);
    const today = new Date();
    
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Ensure we don't go over 100%
    const progress = Math.min(Math.max(Math.floor((daysElapsed / totalDays) * 100), 0), 100);
    
    return progress;
  };

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Active Projects</h1>
          </div>

          {/* Projects List */}
          <div className="space-y-6">
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <span className={`text-xs px-2 py-1 rounded-lg ${
                          project.status === 'active' ? 'bg-green-900 text-green-300' :
                          project.status === 'completed' ? 'bg-blue-900 text-blue-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Unknown Status'}
                        </span>
                        
                        <h2 className="text-xl font-bold mt-2 mb-2">
                          {project.proposals?.[0]?.title || 'Untitled Project'}
                        </h2>
                        
                        <p className="text-gray-400 text-sm mb-4">
                          {project.proposals?.[0]?.short_description || 'No description available'}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
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
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          {/* Project Leader */}
                          {project.profiles && (
                            <div key={`leader-${project.id}`} className="relative z-10">
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
                            </div>
                          )}
                          
                          {/* Project Members (up to 3) */}
                          {project.project_members && project.project_members.slice(0, 3).map((member: any, index: number) => (
                            <div key={`member-${member.id}-${index}`} className="relative">
                              {member.profiles?.avatar_url ? (
                                <Image 
                                  src={member.profiles.avatar_url} 
                                  alt={member.profiles.username || `Member ${index + 1}`}
                                  width={40}
                                  height={40}
                                  className="rounded-full border-2 border-gray-800"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center border-2 border-gray-800">
                                  <span className="text-white font-medium text-xs">
                                    {member.profiles?.username?.substring(0, 2).toUpperCase() || 'M' + (index + 1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {/* Show more members indicator if there are more than 3 */}
                          {project.project_members && project.project_members.length > 3 && (
                            <div key={`more-${project.id}`} className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-800">
                              <span className="text-white text-xs font-medium">+{project.project_members.length - 3}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex-1 max-w-md">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-gray-400">{getProjectProgress(project)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${getProjectProgress(project)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <Link href={`/projects/${project.id}`}>
                        <button className="ml-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm">
                          View Project
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 text-center">
                <h3 className="text-xl font-medium text-gray-300 mb-2">No active projects</h3>
                <p className="text-gray-400 mb-6">
                  There are no active projects yet. Projects are created from approved proposals.
                </p>
                <Link href="/proposals">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5">
                    Browse Proposals
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
