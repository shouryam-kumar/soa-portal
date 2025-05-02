// src/lib/auth.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

export async function signOut() {
  const supabase = createClientComponentClient<Database>();
  
  // Sign out from Supabase
  await supabase.auth.signOut();
  
  // Clear any cached session data
  if (typeof window !== 'undefined') {
    // Clear any localStorage items related to auth
    localStorage.removeItem('supabase.auth.token');
    
    // Use hard navigation with no caching
    window.location.href = '/?logout=' + Date.now();
  }
}