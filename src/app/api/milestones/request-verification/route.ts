import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const formData = await req.formData();
  const milestoneId = formData.get('milestone_id');

  if (!milestoneId || typeof milestoneId !== 'string') {
    return NextResponse.json({ error: 'Missing milestone_id' }, { status: 400 });
  }

  // Update the milestone to set feedback to 'verification_requested'
  const { error } = await supabase
    .from('milestones')
    .update({ feedback: 'verification_requested' })
    .eq('id', milestoneId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(req.headers.get('referer') || '/', { status: 303 });
} 