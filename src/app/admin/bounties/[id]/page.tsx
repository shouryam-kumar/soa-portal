import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import AdminBountyDetailClient from '@/app/admin/bounties/[id]/AdminBountyDetailClient';
import type { Database } from '@/types/database.types';

// Define the required types
interface Submitter {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface UserSubmission {
  id: string;
  bounty_id: string;
  submitter_id: string;
  title: string;
  description: string;
  submission_url: string | null;
  submission_text: string | null;
  status: string;
  points_awarded: number | null;
  feedback: string | null;
  created_at: string | null;
  updated_at: string | null;
  submitter?: Submitter | null;
}

interface Stats {
  total_submissions: number;
  approved_submissions: number;
  total_contributors: number;
}

interface Contributor {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  submission_count: number;
}

type Props = {
  params: {
    id: string;
  };
};

export default async function AdminBountyDetailPage({ params }: Props) {
  // Get the cookie store
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  // Get bounty data
  const { data: bounty, error } = await supabase
    .from('proposals')
    .select(`
      *,
      profiles:creator_id(id, username, avatar_url)
    `)
    .eq('id', params.id)
    .eq('type', 'bounty')
    .single();
  
  // Check if bounty exists
  if (error || !bounty) {
    notFound();
  }
  
  // Verify if user has admin access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    notFound();
  }
  
  const { data: userRole } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  // If not admin, return not found
  if (!userRole || userRole.role !== 'admin') {
    notFound();
  }
  
  // Let's get user profile info
  let userProfile = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    userProfile = profile;
  }
  
  // Check for user's submissions
  let userSubmissions: UserSubmission[] = [];
  if (user) {
    const { data: submissions } = await supabase
      .from('bounty_submissions')
      .select('*, submitter:submitter_id(id, username, avatar_url)')
      .eq('bounty_id', params.id)
      .eq('submitter_id', user.id)
      .order('created_at', { ascending: false });
    userSubmissions = submissions as UserSubmission[] || [];
  }
  
  // Get submission stats using direct queries with proper count handling
  const { count: totalSubmissions } = await supabase
    .from('bounty_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('bounty_id', params.id);
    
  const { count: approvedSubmissions } = await supabase
    .from('bounty_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('bounty_id', params.id)
    .eq('approved', true);
    
  const { data: uniqueContributors } = await supabase
    .from('bounty_submissions')
    .select('submitter_id')
    .eq('bounty_id', params.id)
    .order('submitter_id');
  
  // Calculate unique contributors
  const uniqueSubmitters = new Set(
    uniqueContributors?.map(item => item.submitter_id) || []
  );
    
  const stats: Stats = {
    total_submissions: totalSubmissions || 0,
    approved_submissions: approvedSubmissions || 0,
    total_contributors: uniqueSubmitters.size
  };
  
  // Get recent contributors - using a direct query instead of RPC
  const { data: recentContributorsData } = await supabase
    .from('bounty_submissions')
    .select(`
      submitter_id,
      submitter:profiles!bounty_submissions_submitter_id_fkey(id, username, avatar_url)
    `)
    .eq('bounty_id', params.id)
    .order('created_at', { ascending: false })
    .limit(5);
  
  // Format contributors data
  const contributorMap = new Map<string, number>();
  recentContributorsData?.forEach(item => {
    const userId = item.submitter_id;
    contributorMap.set(userId, (contributorMap.get(userId) || 0) + 1);
  });
  
  const recentContributors: Contributor[] = 
    Array.from(contributorMap.entries()).map(([user_id, submission_count]) => {
      const contributor = recentContributorsData?.find(item => 
        item.submitter_id === user_id
      )?.submitter;
      
      return {
        user_id,
        username: contributor?.username || null,
        avatar_url: contributor?.avatar_url || null,
        submission_count
      };
    });
    
  // Fetch all submissions for this bounty
  const { data: allSubmissionsRaw } = await supabase
    .from('bounty_submissions')
    .select('*, submitter:submitter_id(id, username, avatar_url)')
    .eq('bounty_id', params.id)
    .order('created_at', { ascending: false });

  // Ensure created_at and updated_at are always strings
  const allSubmissions = (allSubmissionsRaw || []).map((sub: any) => ({
    ...sub,
    created_at: sub.created_at || '',
    updated_at: sub.updated_at || '',
  }));
    
  return (
    <AdminBountyDetailClient 
      id={params.id}
      submissions={allSubmissions}
    />
  );
}
