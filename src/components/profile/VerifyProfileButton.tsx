'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';
import type { Database } from '@/types/database.types';

export default function VerifyProfileButton({ verified, email }: { verified: boolean; email: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendVerification = async () => {
    setError(null);
    setSent(false);
    setLoading(true);
    
    try {
      const supabase = createClientComponentClient<Database>();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  if (verified) return null;

  return (
    <div className="my-4">
      <button
        onClick={handleSendVerification}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Verify Profile'}
      </button>
      {sent && <p className="text-green-500 mt-2">Verification email sent! Please check your inbox.</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
} 