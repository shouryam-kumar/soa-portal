import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

  // Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  // Check admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, is_admin')
    .eq('id', user.id)
    .single();
  if (profileError || !(profile?.role === 'admin' || profile?.is_admin)) {
    return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
  }

  // Parse body
  const body = await request.json();
  const { title, description, short_description, total_points, deadline } = body;
  if (!title || !description || !short_description || !total_points || !deadline) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
  }

  // Insert bounty as a proposal of type 'bounty'
  const { data: bounty, error: insertError } = await supabase
    .from('proposals')
    .insert({
      title,
      description,
      short_description,
      total_points,
      deadline,
      creator_id: user.id,
      type: 'bounty',
      status: 'approved',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, bounty }, { status: 201 });
} 