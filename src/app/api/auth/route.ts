import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  
  const { data, error } = await supabase.auth.getSession();
  
  return NextResponse.json({ 
    auth: !!data.session,
    userId: data.session?.user?.id || null,
    error: error?.message || null
  });
}