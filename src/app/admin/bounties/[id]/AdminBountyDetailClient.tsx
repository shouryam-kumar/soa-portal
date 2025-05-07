'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Calendar, 
  Award, 
  ArrowLeft, 
  MessageCircle, 
  Check, 
  X, 
  Clock, 
  FileText,
  User,
  AlertCircle,
  FileEdit,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  Users,
  FilterIcon
} from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import type { Database } from '@/types/database.types';

// Define types for submissions data
interface Submitter {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface BountySubmission {
  id: string;
  bounty_id: string;
  submitter_id: string;
  title: string;
  description: string;
  submission_url?: string | null;
  submission_text?: string | null;
  status: string;
  feedback?: string | null;
  points_awarded?: number | null;
  created_at: string;
  updated_at: string;
  submitter?: Submitter | null;
}

type Bounty = Database['public']['Tables']['proposals']['Row'] & {
  profiles: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
  deadline?: string | null;
};

export default function AdminBountyDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [submissions, setSubmissions] = useState<BountySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const supabase = createClientComponentClient<Database>();
  
  // Fetch bounty details
  useEffect(() => {
    const fetchBounty = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          profiles:creator_id(id, username, avatar_url)
        `)
        .eq('id', id)
        .eq('type', 'bounty')
        .single();
      
      if (error) {
        console.error('Error fetching bounty:', error);
      } else if (data) {
        setBounty(data);
      }
      
      setLoading(false);
    };
    
    fetchBounty();
  }, [supabase, id]);
  
  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      setSubmissionsLoading(true);
      
      // Use a direct query instead of RPC
      try {
        let query = supabase
          .from('submissions')
          .select(`
            *,
            submitter:submitted_by(id, username, avatar_url)
          `)
          .eq('milestone_id', id);
          
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
          
        const { data, error } = await query.order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
          
        // Transform the data to match our expected format
        const transformedData = data.map(item => ({
          id: item.id,
          bounty_id: item.milestone_id, // Map milestone_id to bounty_id
          submitter_id: item.submitted_by, // Map submitted_by to submitter_id
          title: item.content.split('\n')[0] || 'Untitled Submission', // Use first line of content as title
          description: item.content, // Use full content as description
          submission_url: item.links?.[0] || null, // Use first link as submission_url
          submission_text: item.content, // Use content as submission_text
          status: item.approved === true ? 'approved' : item.approved === false ? 'rejected' : 'pending',
          feedback: item.feedback || null,
          points_awarded: null, // Points are not stored in submissions table
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          submitter: item.submitter
        })) as BountySubmission[];
          
        setSubmissions(transformedData);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
      }
      
      setSubmissionsLoading(false);
    };
    
    if (id) {
      fetchSubmissions();
    }
  }, [supabase, id, statusFilter]);
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  // Get status badge style
  const getStatusBadgeStyle = (status: string | null) => {
    switch (status) {
      case 'approved':
        return 'bg-green-900/50 text-green-300';
      case 'rejected':
        return 'bg-red-900/50 text-red-300';
      case 'submitted':
      case 'pending':
        return 'bg-yellow-900/50 text-yellow-300';
      case 'completed':
        return 'bg-indigo-900/50 text-indigo-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };
  
  // Calculate submission stats
  const totalSubmissions = submissions.length;
  const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
  const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected').length;
  
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Bounty Details" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-400">Loading bounty details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (!bounty) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Bounty Details" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold mb-2">Bounty Not Found</h2>
              <p className="text-gray-400 mb-6">The bounty you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Link href="/admin/bounties">
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2">
                  Return to Bounties
                </button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Bounty Details" />
        
        <main className="flex-1 p-6">
          <div className="mb-6">
            <Link href="/admin/bounties" className="text-purple-400 hover:text-purple-300 flex items-center mb-4">
              <ArrowLeft size={16} className="mr-1" />
              Back to Bounties
            </Link>
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-purple-900/50 text-purple-300 px-2.5 py-1 rounded-full text-xs font-medium">
                    Bounty
                  </span>
                  
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(bounty.status)}`}>
                    {bounty.status ? bounty.status.charAt(0).toUpperCase() + bounty.status.slice(1) : 'Unknown'}
                  </span>
                  
                  {bounty.fields?.map((field: string, index: number) => (
                    <span key={index} className="bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full text-xs font-medium">
                      {field}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl font-bold mb-2">{bounty.title}</h1>
                <div className="text-gray-400 text-sm flex items-center">
                  <Calendar size={14} className="mr-1" />
                  Created on {formatDate(bounty.created_at)}
                  {bounty.deadline && (
                    <span className="ml-4 flex items-center">
                      <Clock size={14} className="mr-1" />
                      Due {formatDate(bounty.deadline)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/bounties/${bounty.id}/edit`}>
                  <button className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                    <FileEdit size={16} className="mr-2" />
                    Edit Bounty
                  </button>
                </Link>
                <Link href={`/bounties/${bounty.id}`} target="_blank">
                  <button className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                    <ExternalLink size={16} className="mr-2" />
                    View Public
                  </button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Rest of the component JSX */}
          {/* ... */}
        </main>
      </div>
    </div>
  );
} 