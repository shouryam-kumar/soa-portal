import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import SubmissionForm from '@/components/bounties/SubmissionForm';
import BountyDetailHeader from '@/components/bounties/BountyDetailHeader';

export const dynamic = 'force-dynamic';

// This page allows users to submit their work for a specific bounty
export default async function BountySubmissionPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/login?redirectTo=/bounties/' + params.id + '/submit');
  }

  // Fetch the bounty details
  const { data: bounty, error: bountyError } = await supabase
    .from('proposals')
    .select(`
      *,
      profiles:creator_id(username, avatar_url)
    `)
    .eq('id', params.id)
    .eq('type', 'bounty')
    .eq('status', 'approved')
    .single();
  
  if (bountyError || !bounty) {
    console.error('Error fetching bounty:', bountyError);
    notFound();
  }

  // Check if the user has already submitted to this bounty
  const { data: existingSubmission, error: submissionError } = await supabase
    .from('bounty_submissions')
    .select('*')
    .eq('bounty_id', params.id)
    .eq('submitter_id', session.user.id)
    .single();

  if (submissionError && !submissionError.message.includes('No rows found')) {
    console.error('Error checking existing submission:', submissionError);
  }

  // If the user has already submitted, redirect to the submission view page
  if (existingSubmission) {
    redirect(`/bounties/${params.id}/submissions/${existingSubmission.id}`);
  }

  // Check if the bounty deadline has passed
  const deadlinePassed = bounty.deadline && new Date(bounty.deadline) < new Date();

  return (
    <main className="flex-1 overflow-auto bg-gray-900">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <BountyDetailHeader bounty={bounty} />
        
        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg p-6">
          {deadlinePassed ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-medium text-red-300 mb-2">Submission Deadline Passed</h3>
              <p className="text-gray-400">
                The deadline for submitting to this bounty was {new Date(bounty.deadline).toLocaleDateString()}.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-6">Submit Your Work</h2>
              <SubmissionForm bountyId={params.id} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}