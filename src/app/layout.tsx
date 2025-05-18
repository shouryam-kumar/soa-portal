// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
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
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <SupabaseProvider session={session}>
          <div className="flex flex-col min-h-screen">
            <Header />
            {children}
          </div>
        </SupabaseProvider>
      </body>
    </html>
  );
}