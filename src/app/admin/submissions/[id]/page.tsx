import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';
import Image from 'next/image';

export default async function AdminSubmissionDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const id = params.id;

  // Try to fetch as Project submission
  const { data: projectSub } = await supabase
    .from('submissions')
    .select(`
      id,
      created_at,
      approved,
      feedback,
      content,
      profiles:submitted_by(id, username, avatar_url),
      milestones(id, title, proposal_id, proposals(title))
    `)
    .eq('id', id)
    .single();
  if (projectSub) {
    return (
      <SubmissionDetail
        type="Project"
        submission={projectSub}
        title={projectSub.milestones?.title || projectSub.content || 'Untitled Submission'}
        submitter={projectSub.profiles}
        project={projectSub.milestones?.proposals}
        created_at={projectSub.created_at}
        status={projectSub.approved === true ? 'approved' : projectSub.approved === false ? 'rejected' : 'pending'}
        feedback={projectSub.feedback}
      />
    );
  }

  // Try to fetch as Bounty submission
  const { data: bountySub } = await supabase
    .from('bounty_submissions')
    .select(`
      id,
      created_at,
      status,
      feedback,
      title,
      submitter:submitter_id(id, username, avatar_url),
      bounties:bounty_id(id, title)
    `)
    .eq('id', id)
    .single();
  if (bountySub) {
    return (
      <SubmissionDetail
        type="Bounty"
        submission={bountySub}
        title={bountySub.title || 'Untitled Bounty Submission'}
        submitter={bountySub.submitter}
        project={bountySub.bounties}
        created_at={bountySub.created_at}
        status={bountySub.status || 'pending'}
        feedback={bountySub.feedback}
      />
    );
  }

  // Try to fetch as Proposal submission
  const { data: proposalSub } = await supabase
    .from('proposals')
    .select(`
      id,
      title,
      created_at,
      status,
      description,
      profiles:creator_id(id, username, avatar_url)
    `)
    .eq('id', id)
    .single();
  if (proposalSub) {
    return (
      <SubmissionDetail
        type="Proposal"
        submission={proposalSub}
        title={proposalSub.title || 'Untitled Proposal'}
        submitter={proposalSub.profiles}
        project={proposalSub}
        created_at={proposalSub.created_at}
        status={proposalSub.status === 'approved' ? 'approved' : proposalSub.status === 'rejected' ? 'rejected' : 'pending'}
        feedback={null}
        description={proposalSub.description}
      />
    );
  }

  notFound();
}

function SubmissionDetail({ type, submission, title, submitter, project, created_at, status, feedback, description }: any) {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-4 flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
          type === 'Project' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
          type === 'Bounty' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        }`}>{type}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
          status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
          status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        }`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      {description && <div className="mb-4 text-gray-300">{description}</div>}
      <div className="mb-4 text-gray-400">Submitted: {new Date(created_at).toLocaleString()}</div>
      <div className="mb-4 flex items-center gap-3">
        {submitter?.avatar_url && (
          <Image src={submitter.avatar_url} alt={submitter.username || 'User'} width={32} height={32} className="rounded-full" />
        )}
        <span className="text-gray-200">{submitter?.username || submitter?.name || 'Unknown'}</span>
      </div>
      <div className="mb-4">
        <span className="text-gray-400">Project/Bounty/Proposal: </span>
        <span className="text-gray-200 font-medium">{project?.title || 'Untitled'}</span>
      </div>
      {feedback && (
        <div className="mb-4">
          <span className="text-gray-400">Feedback: </span>
          <span className="text-gray-200">{feedback}</span>
        </div>
      )}
      {/* Add more details as needed */}
    </div>
  );
} 