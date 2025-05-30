import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export default async function AdminProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies });

  // Fetch project
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single();
  if (error || !project) notFound();

  // Fetch proposal for the project
  const { data: proposal } = await supabase
    .from('proposals')
    .select('title, status')
    .eq('id', project.proposal_id)
    .single();

  // Fetch milestones for this project
  const { data: milestonesRaw } = await supabase
    .from('milestones')
    .select('*')
    .eq('proposal_id', project.proposal_id);
  const milestones = Array.isArray(milestonesRaw) ? milestonesRaw : [];

  // Progress calculation
  const totalMilestones = milestones.length;
  const completedCount = milestones.filter((m: any) => m.completed).length;
  const progress = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

  // Determine status badge style
  const getStatusBadgeStyle = (status: string | null | undefined) => {
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
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">{proposal?.title || 'Untitled Project'}</h1>
      <span className={`text-xs px-2 py-1 rounded-lg ${getStatusBadgeStyle(proposal?.status)}`}>
        {proposal?.status === 'approved' ? 'Approved' : proposal?.status === 'completed' ? 'Completed' : proposal?.status === 'under_review' ? 'Under Review' : proposal?.status ? proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) : 'Unknown'}
      </span>
      <div className="mb-4 text-gray-400">Start Date: {project.start_date}</div>
      <div className="mb-4 text-gray-400">Progress: {progress}%</div>
      <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
      <h2 className="text-lg font-semibold mb-4">Milestones</h2>
      <div className="space-y-4">
        {milestones.length === 0 && (
          <div className="text-gray-400">No milestones for this project.</div>
        )}
        {milestones.map((milestone: any) => (
          <div key={milestone.id} className="bg-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="font-medium text-white">{milestone.title}</div>
              <div className="text-gray-400 text-sm mb-2">{milestone.description}</div>
              <div className="text-xs text-gray-500">Status: {milestone.completed ? 'Completed' : milestone.feedback === 'verification_requested' ? 'Verification Requested' : 'Pending'}</div>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              {milestone.feedback === 'verification_requested' && !milestone.completed && (
                <form action="/api/milestones/admin-verify" method="POST" className="flex gap-2">
                  <input type="hidden" name="milestone_id" value={milestone.id} />
                  <button type="submit" name="action" value="approve" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Approve</button>
                  <button type="submit" name="action" value="reject" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Reject</button>
                </form>
              )}
              {milestone.completed && (
                <span className="px-3 py-1 bg-green-700 text-green-200 rounded-full text-xs">Completed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 