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

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <SupabaseProvider session={session}>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1 pt-16"> {/* Added pt-16 for header space */}
              <Sidebar />
              <main className="flex-1 ml-4 md:ml-64 p-4"> {/* Main content with margin for sidebar */}
                {children}
              </main>
            </div>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}