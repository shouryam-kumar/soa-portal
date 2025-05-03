import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Database } from '@/types/database.types';

// Server-side functions
export async function getServerSession() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function getUserProfile(userId: string) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  const { data } = await supabase.from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  return data;
}

// Client-side functions
export function createClient() {
  return createClientComponentClient<Database>();
}

export async function signOut() {
  const supabase = createClientComponentClient<Database>();
  await supabase.auth.signOut();
  window.location.href = '/';
}