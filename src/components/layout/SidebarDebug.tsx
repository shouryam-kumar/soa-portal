'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import type { Database } from '@/types/database.types';

export default function SidebarDebug() {
  const { user, supabase } = useSupabase();
  const [debugInfo, setDebugInfo] = useState<{ 
    message: string;
    data?: any;
    error?: any;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const checkProposals = async () => {
    setLoading(true);
    try {
      if (!user) {
        setDebugInfo({ 
          message: 'No authenticated user found',
          data: null 
        });
        return;
      }
      
      console.log("Checking proposals for user:", user.id);
      
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('creator_id', user.id);
      
      if (error) {
        setDebugInfo({ 
          message: 'Error fetching proposals',
          error 
        });
        return;
      }
      
      setDebugInfo({ 
        message: `Found ${data.length} proposals`,
        data 
      });
    } catch (err) {
      setDebugInfo({ 
        message: 'Exception while fetching proposals',
        error: err 
      });
    } finally {
      setLoading(false);
    }
  };

  const createSampleProposal = async () => {
    setLoading(true);
    try {
      if (!user) {
        setDebugInfo({ 
          message: 'No authenticated user found to create proposal',
          data: null 
        });
        return;
      }
      
      // Create a sample proposal for testing
      const newProposal = {
        creator_id: user.id,
        title: `Test Proposal ${new Date().toISOString().slice(0, 10)}`,
        description: 'This is a test proposal created for debugging the sidebar',
        short_description: 'Test proposal for debugging',
        total_points: 100,
        type: 'project',
        status: 'draft',
        created_at: new Date().toISOString(),
        fields: ['infrastructure', 'development'],
        skills_required: ['javascript', 'react']
      };
      
      const { data, error } = await supabase
        .from('proposals')
        .insert(newProposal)
        .select();
      
      if (error) {
        setDebugInfo({ 
          message: 'Error creating test proposal',
          error 
        });
        return;
      }
      
      setDebugInfo({ 
        message: 'Test proposal created successfully',
        data 
      });
      
      // Refresh proposals
      checkProposals();
    } catch (err) {
      setDebugInfo({ 
        message: 'Exception while creating test proposal',
        error: err 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-check on first load
    if (user) {
      checkProposals();
    }
  }, [user]);

  // Don't render if not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg mb-4">
      <h3 className="text-lg font-medium text-white mb-2">Sidebar Debug</h3>
      <p className="text-sm text-gray-400 mb-4">User ID: {user.id}</p>
      
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={checkProposals}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          {loading ? 'Loading...' : 'Check My Proposals'}
        </button>
        
        <button 
          onClick={createSampleProposal}
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          {loading ? 'Creating...' : 'Create Test Proposal'}
        </button>
      </div>
      
      {debugInfo && (
        <div className="rounded border border-gray-700 bg-gray-900 p-3">
          <p className="font-medium text-gray-300 mb-2">{debugInfo.message}</p>
          
          {debugInfo.error && (
            <div className="p-2 bg-red-900/30 rounded border border-red-800 text-red-300 mb-2 text-xs">
              <p className="font-mono">{JSON.stringify(debugInfo.error, null, 2)}</p>
            </div>
          )}
          
          {debugInfo.data && (
            <div className="p-2 bg-blue-900/30 rounded border border-blue-800 text-xs font-mono text-blue-300 whitespace-pre-wrap overflow-auto max-h-60">
              {JSON.stringify(debugInfo.data, null, 2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 