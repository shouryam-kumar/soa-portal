import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function MySubmissionsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login?redirectTo=/bounties/my-submissions');
  }

  // Fetch all submissions by the current user
  const { data: submissions, error } = await supabase
    .from('bounty_submissions')
    .select(`
      *,
      bounty:bounty_id(
        id,
        title,
        total_points,
        deadline
      )
    `)
    .eq('submitter_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error);
  }

  // Group submissions by status
  const pendingSubmissions = submissions?.filter(sub => sub.status === 'pending') || [];
  const approvedSubmissions = submissions?.filter(sub => sub.status === 'approved') || [];
  const rejectedSubmissions = submissions?.filter(sub => sub.status === 'rejected') || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/30 border-yellow-800 text-yellow-300';
      case 'approved':
        return 'bg-green-900/30 border-green-800 text-green-300';
      case 'rejected':
        return 'bg-red-900/30 border-red-800 text-red-300';
      default:
        return 'bg-gray-800 border-gray-700 text-gray-300';
    }
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <Link 
            href="/bounties" 
            className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Bounties
          </Link>
          <h1 className="text-2xl font-bold">My Bounty Submissions</h1>
          <p className="text-gray-400 mt-2">
            Track the status of all your bounty submissions
          </p>
        </div>

        {submissions && submissions.length > 0 ? (
          <div className="space-y-10">
            {/* Pending Submissions */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Clock className="h-5 w-5 text-yellow-400 mr-2" />
                Pending Review ({pendingSubmissions.length})
              </h2>
              {pendingSubmissions.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingSubmissions.map((submission) => (
                    <SubmissionCard 
                      key={submission.id} 
                      submission={submission} 
                      statusClass={getStatusClass(submission.status)}
                      statusIcon={getStatusIcon(submission.status)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">No pending submissions</p>
              )}
            </div>

            {/* Approved Submissions */}
            {approvedSubmissions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  Approved ({approvedSubmissions.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {approvedSubmissions.map((submission) => (
                    <SubmissionCard 
                      key={submission.id} 
                      submission={submission} 
                      statusClass={getStatusClass(submission.status)}
                      statusIcon={getStatusIcon(submission.status)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Submissions */}
            {rejectedSubmissions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <XCircle className="h-5 w-5 text-red-400 mr-2" />
                  Rejected ({rejectedSubmissions.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {rejectedSubmissions.map((submission) => (
                    <SubmissionCard 
                      key={submission.id} 
                      submission={submission} 
                      statusClass={getStatusClass(submission.status)}
                      statusIcon={getStatusIcon(submission.status)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-10 text-center">
            <h3 className="text-xl font-medium text-gray-300 mb-2">No submissions yet</h3>
            <p className="text-gray-400 mb-6">
              You haven't submitted any work for bounties yet.
            </p>
            <Link href="/bounties">
              <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2.5">
                Browse Available Bounties
              </button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

// Submission card component
function SubmissionCard({ 
  submission, 
  statusClass, 
  statusIcon 
}: { 
  submission: any, 
  statusClass: string,
  statusIcon: React.ReactNode
}) {
  const formattedDate = new Date(submission.created_at).toLocaleDateString();
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`inline-flex items-center text-xs px-2 py-1 rounded-lg ${statusClass}`}>
            {statusIcon}
            <span className="ml-1 capitalize">{submission.status}</span>
          </span>
          
          <h3 className="text-lg font-bold mt-2">{submission.title}</h3>
        </div>
        {submission.points_awarded > 0 && (
          <div className="text-lg font-bold text-purple-400">+{submission.points_awarded} pts</div>
        )}
      </div>
      
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{submission.description}</p>
      
      <div className="border-t border-gray-700 pt-4 mt-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            For: <Link href={`/bounties/${submission.bounty.id}`} className="text-purple-400 hover:underline">
              {submission.bounty.title}
            </Link>
          </div>
          
          <div className="text-sm text-gray-400">
            Submitted: {formattedDate}
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <Link href={`/bounties/${submission.bounty.id}/submissions/${submission.id}`}>
          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 text-sm">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}