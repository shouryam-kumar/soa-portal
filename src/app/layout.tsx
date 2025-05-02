// src/app/layout.tsx (server component)
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import SupabaseProvider from '@/components/providers/SupabaseProvider';
import ClientEffects from '@/components/ClientEffects';

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
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  });
  
  // Get session
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <SupabaseProvider session={session}>
          <ClientEffects />
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
              {children}
            </div>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}