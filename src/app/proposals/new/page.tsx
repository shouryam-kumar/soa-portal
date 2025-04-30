'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import ProposalForm from '@/components/proposals/ProposalForm';
import Sidebar from '@/components/layout/Sidebar';

export default function NewProposalPage() {
  const { user, session } = useSupabase();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!session) {
      router.push('/login?redirect=/proposals/new');
    }
  }, [session, router]);

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <Link href="/proposals" className="text-blue-400 hover:text-blue-300 flex items-center mb-6">
            <ArrowLeft size={16} className="mr-1" />
            Back to Proposals
          </Link>
          
          <ProposalForm />
        </div>
      </main>
    </>
  );
}