import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';

export async function DELETE(req: NextRequest, { params }: { params: { bountyId: string; submissionId: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('DELETE request received', { params, user: user?.id });
  if (!user) {
    console.error('Unauthorized: No user');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the submission to check ownership
  const { data: submission, error } = await supabase
    .from('bounty_submissions')
    .select('id, submitter_id')
    .eq('id', params.submissionId)
    .eq('bounty_id', params.bountyId)
    .single();

  if (error || !submission) {
    console.error('Submission not found', { error, params });
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  // Check if user is owner or admin
  let isAdmin = false;
  if (user.id === submission.submitter_id) {
    isAdmin = false;
  } else {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'admin';
    if (!isAdmin) {
      console.error('Unauthorized: Not owner or admin', { user: user.id });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Delete the submission
  const { error: deleteError } = await supabase
    .from('bounty_submissions')
    .delete()
    .eq('id', params.submissionId)
    .eq('bounty_id', params.bountyId);

  if (deleteError) {
    console.error('Failed to delete submission', { deleteError, params });
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }

  console.log('Submission deleted successfully', { params });
  return NextResponse.json({ success: true });
} 