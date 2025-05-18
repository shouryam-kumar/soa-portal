'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  CheckCircle, 
  Clock,
  BarChart3,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  Cog,
  Users,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Database } from '@/types/database.types';

// Dynamically import AdminHeader
const AdminHeader = dynamic(() => import('@/components/admin/AdminHeader'), { 
  ssr: false 
});

// Define project type
interface Project {
  id: string;
  title: string;
  lead: string;
  team_size: number;
  start_date: string;
  status: 'active' | 'completed' | 'planned';
  progress: number;
  budget: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  completed?: boolean | null;
  completed_at?: string | null;
  feedback?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  proposal_id: string;
}

interface ProjectWithMilestones {
  id: string;
  title: string;
  lead: string;
  team_size: number;
  start_date: string;
  status: 'active' | 'completed' | 'planned';
  progress: number;
  budget: number;
  milestones: Milestone[];
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithMilestones[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof ProjectWithMilestones>('start_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      // Fetch all projects with related proposal title
      let { data: projectsRaw, error } = await supabase
        .from('projects')
        .select('id, status, start_date, proposal_id, proposals(title)');
      if (error || !projectsRaw) {
        setProjects([]);
        setLoading(false);
        return;
      }
      // Fetch all milestones for these projects
      const proposalIds = projectsRaw.map((p: any) => p.proposal_id).filter(Boolean);
      let milestones: Milestone[] = [];
      if (proposalIds.length > 0) {
        const { data: milestonesRaw } = await supabase
          .from('milestones')
          .select('*')
          .in('proposal_id', proposalIds);
        milestones = (milestonesRaw as Milestone[]) || [];
      }
      // Map projects to include milestones and use proposal title
      const projectsWithMilestones: ProjectWithMilestones[] = projectsRaw.map((p: any) => {
        const title = p.proposals?.title || 'Untitled';
        const milestonesForProject = milestones.filter(m => m.proposal_id === p.proposal_id);
        const completedCount = milestonesForProject.filter(m => m.completed).length;
        const totalCount = milestonesForProject.length;
        const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        return {
          id: p.id,
          title,
          lead: 'Unknown', // Not fetched here
          team_size: 1, // fallback
          start_date: p.start_date,
          status: p.status,
          progress,
          budget: 0,
          milestones: milestonesForProject,
        };
      });
      setProjects(projectsWithMilestones);
      setLoading(false);
    };
    fetchProjects();
  }, [supabase]);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      // Apply search query filter
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply status filter
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Apply sorting
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field: keyof ProjectWithMilestones) => {
    if (sortField === field) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Helper function to get status badge color
  const getStatusBadge = (status: ProjectWithMilestones['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'planned':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Approve milestone verification
  const handleApprove = async (milestoneId: string) => {
    await supabase
      .from('milestones')
      .update({ completed: true, completed_at: new Date().toISOString(), feedback: null })
      .eq('id', milestoneId);
    // Refresh projects
    setProjects(projects =>
      projects.map(project => ({
        ...project,
        milestones: project.milestones.map(m =>
          m.id === milestoneId ? { ...m, completed: true, completed_at: new Date().toISOString(), feedback: null } : m
        ),
      }))
    );
  };

  // Reject milestone verification
  const handleReject = async (milestoneId: string) => {
    await supabase
      .from('milestones')
      .update({ feedback: null }) // Reset verification request
      .eq('id', milestoneId);
    // Refresh projects
    setProjects(projects =>
      projects.map(project => ({
        ...project,
        milestones: project.milestones.map(m =>
          m.id === milestoneId ? { ...m, feedback: null } : m
        ),
      }))
    );
  };

  return (
    <>
      <AdminHeader title="Projects" />
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h2 className="text-xl text-white mb-2">Manage and monitor ongoing projects</h2>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center">
            <Cog size={16} className="mr-2" />
            <span>New Project</span>
          </button>
          <button className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 flex items-center">
            <Download size={16} className="mr-2" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <div className="w-full md:w-48">
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="planned">Planned</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Projects Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-750">
                <th className="px-6 py-3 text-sm font-medium text-gray-300">Project Title</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">Status</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">Progress</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                      <span>Loading projects...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    No projects found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <Link href={`/admin/projects/${project.id}`} className="font-medium text-white hover:text-blue-400 transition-colors">
                        {project.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(project.status)}`}>
                        {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400 mt-1 block">{project.progress}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/projects/${project.id}`} className="p-1.5 bg-blue-600/20 rounded-md hover:bg-blue-600/30 transition-colors">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
} 