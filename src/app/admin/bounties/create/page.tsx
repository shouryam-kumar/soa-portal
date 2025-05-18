"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, PlusCircle } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database.types";
import DeleteSubmissionButton from '@/components/DeleteSubmissionButton';

export default function AdminCreateBountyPage() {
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [totalPoints, setTotalPoints] = useState("");
  const [deadline, setDeadline] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      setChecking(true);
      const supabase = createClientComponentClient<Database>();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', session.user.id)
        .single();
      setIsAdmin(userProfile?.role === 'admin' || !!userProfile?.is_admin);
      setChecking(false);
    };
    checkAdmin();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Checking admin access...</div>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <ShieldCheck size={48} className="mb-4 text-red-500" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p>You must be an admin to access this page.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // Convert local datetime to UTC ISO string
      let deadlineISO = "";
      if (deadline) {
        const localDate = new Date(deadline);
        deadlineISO = localDate.toISOString(); // always UTC
      }
      const res = await fetch("/api/admin/bounties/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          short_description: shortDescription,
          total_points: Number(totalPoints),
          deadline: deadlineISO,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to create bounty");
        setLoading(false);
        return;
      }
      setSuccess("Bounty created successfully!");
      setTitle("");
      setDescription("");
      setShortDescription("");
      setTotalPoints("");
      setDeadline("");
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-lg">
        <div className="flex items-center mb-6">
          <PlusCircle size={28} className="text-purple-400 mr-3" />
          <h1 className="text-2xl font-bold text-white">Create New Bounty</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 mb-1">Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Short Description</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Reward (Points)</label>
            <input
              type="number"
              min="1"
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={totalPoints}
              onChange={e => setTotalPoints(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Deadline</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Time will be stored in UTC. Your current timezone: {timezone}</p>
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {success && <div className="text-green-400 text-sm">{success}</div>}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Bounty"}
          </button>
        </form>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store'; 