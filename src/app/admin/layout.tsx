'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';
import type { Database } from '@/types/database.types';

// Define props for the layout component
interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();
  
  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login';
  
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // Skip for login page
        if (isLoginPage) {
          setLoading(false);
          return;
        }
        
        // Check session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // No session, redirect to admin login
          router.replace('/admin/login');
          return;
        }
        
        // Check if user is admin
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (error || !profile?.is_admin) {
          // Not an admin, redirect to admin login
          console.error('Admin check failed:', error || 'Not an admin');
          await supabase.auth.signOut();
          router.replace('/admin/login');
          return;
        }
        
        // User is authenticated and is an admin
        setLoading(false);
      } catch (error) {
        console.error('Admin auth check error:', error);
        router.replace('/admin/login');
      }
    };
    
    checkAdminAuth();
  }, [supabase, router, pathname, isLoginPage]);
  
  // Show loading indicator while checking authentication
  if (loading && !isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white">Verifying admin access...</p>
        </div>
      </div>
    );
  }
  
  // Render children (either login page or protected admin content)
  return <>{children}</>;
}