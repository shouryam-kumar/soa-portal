"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database.types";
import React from "react";

export default function EditBountyPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [totalPoints, setTotalPoints] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState('approved');

  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;

  // Fetch bounty details
  useEffect(() => {
    const fetchBounty = async () => {
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .eq("id", id)
        .eq("type", "bounty")
        .single();
      if (error || !data) {
        setError("Could not load bounty");
        setLoading(false);
        return;
      }
      const bounty = data as Database['public']['Tables']['proposals']['Row'];
      setTitle(bounty.title || "");
      setShortDescription(bounty.short_description || "");
      setDescription(bounty.description || "");
      setTotalPoints(bounty.total_points?.toString() || "");
      setDeadline(bounty.deadline ? new Date(bounty.deadline).toISOString().slice(0, 16) : "");
      setLoading(false);
    };
    fetchBounty();
    // eslint-disable-next-line
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // Convert deadline to UTC ISO string
      let deadlineISO = "";
      if (deadline) {
        const localDate = new Date(deadline);
        deadlineISO = localDate.toISOString();
      }
      const res = await fetch(`/api/admin/bounties/${id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          short_description: shortDescription,
          description,
          total_points: Number(totalPoints),
          deadline: deadlineISO,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Failed to update bounty");
      } else {
        setSuccess("Bounty updated successfully!");
        setTimeout(() => router.push(`/admin/bounties/${id}`), 1200);
      }
    } catch (err) {
      setError("Failed to update bounty");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p>Loading bounty...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Bounty</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-lg p-6 mt-4 w-full max-w-xl space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input type="text" className="w-full rounded px-3 py-2 bg-gray-700 text-white" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Short Description</label>
          <input type="text" className="w-full rounded px-3 py-2 bg-gray-700 text-white" value={shortDescription} onChange={e => setShortDescription(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea className="w-full rounded px-3 py-2 bg-gray-700 text-white" value={description} onChange={e => setDescription(e.target.value)} rows={5} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Reward (Points)</label>
          <input type="number" className="w-full rounded px-3 py-2 bg-gray-700 text-white" value={totalPoints} onChange={e => setTotalPoints(e.target.value)} min={1} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Deadline</label>
          <input type="datetime-local" className="w-full rounded px-3 py-2 bg-gray-700 text-white" value={deadline} onChange={e => setDeadline(e.target.value)} required />
          <p className="text-xs text-gray-400 mt-1">Time zone: UTC (converted automatically)</p>
        </div>
        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 font-semibold" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
        {error && <p className="text-red-400 mt-2">{error}</p>}
        {success && <p className="text-green-400 mt-2">{success}</p>}
      </form>
    </div>
  );
} 