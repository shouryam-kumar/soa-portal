import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export async function POST(request: Request, { params }: { params: { id: string } }) {
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
  const { title, short_description, description, total_points, deadline, status } = body;
  if (!title || !short_description || !description || !total_points || !deadline || !status) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
  }

  // Update bounty
  const { data: bounty, error: updateError } = await supabase
    .from('proposals')
    .update({
      title,
      short_description,
      description,
      total_points,
      deadline,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .eq('type', 'bounty')
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, bounty }, { status: 200 });
} 