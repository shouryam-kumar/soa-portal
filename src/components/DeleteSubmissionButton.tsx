"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteSubmissionButton({ submissionId, bountyId }: { submissionId: string; bountyId: string }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bounties/${bountyId}/submissions/${submissionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push(`/bounties/my-submissions`);
        router.refresh();
      } else {
        alert('Failed to delete submission.');
      }
    } catch (err) {
      alert('Failed to delete submission.');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h2>
      <button
        className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 font-semibold"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
      >
        Delete Submission
      </button>
      {showConfirm && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-lg">
          <p className="mb-3 text-red-300">Are you sure you want to delete this submission? This action cannot be undone.</p>
          <div className="flex space-x-2">
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="bg-red-700 hover:bg-red-800 text-white rounded-lg px-4 py-2"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 