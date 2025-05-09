// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { createServerClient } from '@/lib/supabase-server';
import SupabaseProvider from '@/components/providers/SupabaseProvider';

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
  // Create a server-side client with proper cookie handling
  const supabase = await createServerClient();
  
  // Get initial session for hydration (without using cookies().get)
  const { data } = await supabase.auth.getSession();
  const session = data.session;

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