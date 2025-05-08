// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import SupabaseProvider from '@/components/providers/SupabaseProvider';
import type { Database } from '@/types/database.types';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Okto Summer of Abstraction Portal',
  description: 'Contribute to the Okto ecosystem and earn rewards',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Properly handle cookies
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });
  
  // Get initial session for hydration
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  
  // Note: The conditional rendering based on admin path is handled by the
  // Header and Sidebar components themselves. They check the pathname
  // and return null if it's an admin route.

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <SupabaseProvider session={session}>
          <div className="flex flex-col min-h-screen">
            {/* Header will not render itself on admin pages */}
            <Header />
            <div className="flex flex-1">
              {/* Sidebar will not render itself on admin pages */}
              <Sidebar />
              {/* Add pl-72 class instead of pl-64 to increase spacing between sidebar and content */}
              <main className="flex-1 p-6 md:pl-72">
                {children}
              </main>
            </div>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}