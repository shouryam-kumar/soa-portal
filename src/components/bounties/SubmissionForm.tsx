'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AlertCircle, Loader2 } from 'lucide-react';

interface SubmissionFormProps {
  bountyId: string;
}

export default function SubmissionForm({ bountyId }: SubmissionFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to submit');
      }
      
      // Validate form
      if (!title.trim()) {
        throw new Error('Please provide a title for your submission');
      }
      
      if (!description.trim()) {
        throw new Error('Please provide a description of your work');
      }
      
      if (!submissionUrl.trim() && !submissionText.trim()) {
        throw new Error('Please provide either a URL or details of your submission');
      }
      
      // Create submission
      const { data, error: submissionError } = await supabase
        .from('bounty_submissions')
        .insert({
          bounty_id: bountyId,
          submitter_id: user.id,
          title,
          description,
          submission_url: submissionUrl || null,
          submission_text: submissionText || null,
          status: 'pending'
        })
        .select()
        .single();
      
      if (submissionError) throw submissionError;
      
      // Redirect to the submission detail page
      router.push(`/bounties/${bountyId}/submissions/${data.id}`);
      router.refresh();
      
    } catch (error) {
      console.error('Error submitting work:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
          Submission Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your submission a clear, descriptive title"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your approach and what you've accomplished"
          rows={4}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="submissionUrl" className="block text-sm font-medium text-gray-300 mb-1">
          Submission URL
        </label>
        <input
          type="url"
          id="submissionUrl"
          value={submissionUrl}
          onChange={(e) => setSubmissionUrl(e.target.value)}
          placeholder="https://github.com/yourusername/your-repo"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="mt-1 text-sm text-gray-400">
          Provide a link to your code repository, demo, or other relevant resource
        </p>
      </div>
      
      <div>
        <label htmlFor="submissionText" className="block text-sm font-medium text-gray-300 mb-1">
          Additional Details
        </label>
        <textarea
          id="submissionText"
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
          placeholder="Provide any additional details, instructions, or notes about your submission"
          rows={6}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-5 py-2.5 mr-3"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2.5 flex items-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Work'
          )}
        </button>
      </div>
    </form>
  );
}