'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import React from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User,
  Check, 
  X, 
  AlertCircle,
  ExternalLink,
  FileText,
  Award
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import type { Database } from '@/types/database.types';

interface Submitter {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface Bounty {
  id: string;
  title: string;
  description: string;
  status: string | null;
  total_points: number;
  deadline: string | null;
}

interface Submission {
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
  bounty?: Bounty | null;
}

export default function AdminSubmissionDetail({ 
  params 
}: { 
  params: Promise<{ id: string; submissionId: string }> 
}) {
  // Unwrap params using React.use
  const unwrappedParams = React.use(params);
  const bountyId = unwrappedParams.id;
  const submissionId = unwrappedParams.submissionId;
  
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient<Database>();
  
  // Fetch submission details
  useEffect(() => {
    const fetchSubmission = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('bounty_submissions')
        .select(`
          *,
          submitter:submitter_id(id, username, avatar_url),
          bounty:bounty_id(id, title, description, total_points, status, deadline)
        `)
        .eq('id', submissionId)
        .single();
      
      if (error) {
        console.error('Error fetching submission:', error);
        return;
      }

      if (data) {
        // Transform the data to match our Submission interface
        const transformedData: Submission = {
          id: data.id,
          bounty_id: data.bounty_id,
          submitter_id: data.submitter_id,
          title: data.title,
          description: data.description,
          submission_url: data.submission_url || null,
          submission_text: data.submission_text || null,
          status: data.status,
          feedback: data.feedback || null,
          points_awarded: data.points_awarded || null,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
          submitter: data.submitter,
          bounty: data.bounty ? {
            id: data.bounty.id,
            title: data.bounty.title,
            description: data.bounty.description,
            status: data.bounty.status,
            total_points: data.bounty.total_points,
            deadline: data.bounty.deadline
          } : null
        };
        setSubmission(transformedData);
      }
      
      setLoading(false);
    };
    
    fetchSubmission();
  }, [supabase, bountyId, submissionId]);
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-900 border-green-800 text-green-300';
      case 'rejected':
        return 'bg-red-900 border-red-800 text-red-300';
      case 'pending':
        return 'bg-yellow-900 border-yellow-800 text-yellow-300';
      default:
        return 'bg-gray-800 border-gray-700 text-gray-300';
    }
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white">
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Submission Details" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-400">Loading submission details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (!submission) {
    return (
      <div className="flex min-h-screen bg-gray-900 text-white">
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Submission Details" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold mb-2">Submission Not Found</h2>
              <p className="text-gray-400 mb-6">The submission you're looking for doesn't exist or has been removed.</p>
              <Link href={`/admin/bounties/${bountyId}`}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2">
                  Return to Bounty
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
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Submission Details" />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <Link 
              href={`/admin/bounties/${bountyId}`} 
              className="text-purple-400 hover:text-purple-300 flex items-center mb-4"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Bounty
            </Link>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="px-3 py-1.5 text-sm font-medium rounded-lg inline-flex items-center mb-2 bg-purple-900 text-purple-200">
                  Submitted
                </div>
                
                <h1 className="text-2xl font-bold">{submission.title}</h1>
                
                <div className="mt-2 text-gray-400 text-sm">
                  Submitted on {formatDate(submission.created_at)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Submission Content */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Description</h2>
                <div className="text-gray-300 whitespace-pre-line mb-6">
                  {submission.description}
                </div>
                
                {submission.submission_url && (
                  <div className="mb-6">
                    <h3 className="text-md font-bold mb-2">Submission URL</h3>
                    <a 
                      href={submission.submission_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-purple-400 hover:text-purple-300 flex items-center"
                    >
                      {submission.submission_url}
                      <ExternalLink size={14} className="ml-1.5" />
                    </a>
                  </div>
                )}
                
                {submission.submission_text && (
                  <div>
                    <h3 className="text-md font-bold mb-2">Additional Details</h3>
                    <div className="bg-gray-750 rounded-lg p-4 border border-gray-700 text-gray-300 whitespace-pre-line">
                      {submission.submission_text}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Bounty Info */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Bounty Info</h2>
                
                <Link 
                  href={`/admin/bounties/${submission.bounty_id}`}
                  className="block mb-3 text-purple-400 hover:text-purple-300 font-medium"
                >
                  {submission.bounty?.title}
                </Link>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Points:</span>
                    <span className="font-bold text-purple-400">
                      {submission.bounty?.total_points.toLocaleString()}
                    </span>
                  </div>
                  
                  {submission.bounty?.deadline && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Deadline:</span>
                      <span>{formatDate(submission.bounty.deadline)}</span>
                    </div>
                  )}
                </div>
                
                <Link href={`/bounties/${submission.bounty_id}`} target="_blank" className="mt-4 block">
                  <button className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm flex items-center justify-center">
                    <ExternalLink size={16} className="mr-2" />
                    View Public Bounty
                  </button>
                </Link>
              </div>
              
              {/* Submitter Info */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Submitted By</h2>
                
                <div className="flex items-center gap-3">
                  {submission.submitter?.avatar_url ? (
                    <img
                      src={submission.submitter.avatar_url}
                      alt={submission.submitter.username || 'User'}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <User size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{submission.submitter?.username || 'Unknown User'}</div>
                    <div className="text-sm text-gray-400">Submitted {formatDate(submission.created_at)}</div>
                  </div>
                </div>
                
                {submission.submitter?.id && (
                  <Link href={`/admin/users/${submission.submitter.id}`}>
                    <button className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm flex items-center justify-center">
                      <User size={16} className="mr-2" />
                      View User Profile
                    </button>
                  </Link>
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Submission Status</h2>
                <div className="p-4 bg-purple-900/30 border border-purple-800 rounded-lg text-center">
                  <Check size={24} className="mx-auto mb-2 text-purple-400" />
                  <p className="text-purple-200 font-medium">This submission has been received.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}