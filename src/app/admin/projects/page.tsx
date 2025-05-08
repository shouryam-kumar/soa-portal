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

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Project>('start_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // For demo purposes, use mock data
        const mockProjects: Project[] = [
          {
            id: '1',
            title: 'Okto SDK Integration',
            lead: 'Alex Johnson',
            team_size: 4,
            start_date: '2023-10-15',
            status: 'active',
            progress: 65,
            budget: 12000,
          },
          {
            id: '2',
            title: 'Web3 Authentication Service',
            lead: 'Maria Garcia',
            team_size: 3,
            start_date: '2023-09-01',
            status: 'active',
            progress: 80,
            budget: 8500,
          },
          {
            id: '3',
            title: 'Smart Contract Auditing Tool',
            lead: 'James Wilson',
            team_size: 6,
            start_date: '2023-11-05',
            status: 'planned',
            progress: 10,
            budget: 15000,
          },
          {
            id: '4',
            title: 'Account Abstraction Wallet',
            lead: 'Sarah Chen',
            team_size: 5,
            start_date: '2023-08-20',
            status: 'completed',
            progress: 100,
            budget: 20000,
          },
          {
            id: '5',
            title: 'Cross-Chain Bridge Integration',
            lead: 'Michael Okonjo',
            team_size: 7,
            start_date: '2023-10-10',
            status: 'active',
            progress: 45,
            budget: 18000,
          }
        ];
        
        setProjects(mockProjects);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [supabase]);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      // Apply search query filter
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.lead.toLowerCase().includes(searchQuery.toLowerCase());
      
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

  const handleSort = (field: keyof Project) => {
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
  const getStatusBadge = (status: Project['status']) => {
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
                <th className="px-6 py-3">
                  <button 
                    className="text-sm font-medium text-gray-300 flex items-center"
                    onClick={() => handleSort('title')}
                  >
                    Project Title
                    {sortField === 'title' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={14} className="ml-1" /> : 
                        <ChevronDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    className="text-sm font-medium text-gray-300 flex items-center"
                    onClick={() => handleSort('lead')}
                  >
                    Lead
                    {sortField === 'lead' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={14} className="ml-1" /> : 
                        <ChevronDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    className="text-sm font-medium text-gray-300 flex items-center"
                    onClick={() => handleSort('team_size')}
                  >
                    Team Size
                    {sortField === 'team_size' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={14} className="ml-1" /> : 
                        <ChevronDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    className="text-sm font-medium text-gray-300 flex items-center"
                    onClick={() => handleSort('start_date')}
                  >
                    Start Date
                    {sortField === 'start_date' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={14} className="ml-1" /> : 
                        <ChevronDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    className="text-sm font-medium text-gray-300 flex items-center"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={14} className="ml-1" /> : 
                        <ChevronDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    className="text-sm font-medium text-gray-300 flex items-center"
                    onClick={() => handleSort('progress')}
                  >
                    Progress
                    {sortField === 'progress' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={14} className="ml-1" /> : 
                        <ChevronDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button 
                    className="text-sm font-medium text-gray-300 flex items-center"
                    onClick={() => handleSort('budget')}
                  >
                    Budget
                    {sortField === 'budget' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp size={14} className="ml-1" /> : 
                        <ChevronDown size={14} className="ml-1" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                      <span>Loading projects...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
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
                    <td className="px-6 py-4 text-gray-300">
                      <div className="flex items-center">
                        <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white text-xs font-bold">
                            {project.lead.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span>{project.lead}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Users size={16} className="text-indigo-400 mr-2" />
                        <span className="text-gray-300">{project.team_size}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-blue-400 mr-2" />
                        <span className="text-gray-300">{new Date(project.start_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(project.status)}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
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
                    <td className="px-6 py-4 text-gray-300">
                      ${project.budget.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-1.5 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                          <Cog size={16} className="text-gray-300" />
                        </button>
                        <Link href={`/admin/projects/${project.id}`} className="p-1.5 bg-blue-600/20 rounded-md hover:bg-blue-600/30 transition-colors">
                          <BarChart3 size={16} className="text-blue-400" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Project Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Active Projects</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                {projects.filter(p => p.status === 'active').length}
              </h3>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Clock className="text-green-500" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Completed Projects</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                {projects.filter(p => p.status === 'completed').length}
              </h3>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <CheckCircle className="text-blue-500" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Total Budget</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                ${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
              </h3>
            </div>
            <div className="bg-indigo-500/20 p-3 rounded-lg">
              <BarChart3 className="text-indigo-500" size={24} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 