// src/app/profile/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Database } from '@/types/database.types';
import ProfileForm from '@/components/profile/ProfileForm';

export default async function ProfilePage() {
  // Properly handle cookies
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // Redirect to login if not authenticated
    redirect('/login');
  }
  
  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Profile" 
                className="w-20 h-20 rounded-full mr-4"
              />
            ) : (
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-2xl font-bold">
                  {(profile?.username?.charAt(0) || session.user.email?.charAt(0) || 'U').toUpperCase()}
                </span>
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-semibold">
                {profile?.username || session.user.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-gray-400">{session.user.email}</p>
              {profile?.okto_points !== undefined && (
                <p className="text-blue-400 mt-1">
                  {profile.okto_points} points
                </p>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
            <ProfileForm initialProfile={profile} userId={session.user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}