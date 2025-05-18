import { notFound, redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import ProposalForm from '@/components/proposals/ProposalForm';
import { updateProposal } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import { cookies as nextCookies } from 'next/headers';

export default async function EditProposalPage({ params }: { params: { id: string } }) {
  const proposalId = params.id;
  if (!proposalId) notFound();
  const id: string = proposalId as string;
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Fetch proposal
  const { data: proposal, error } = await supabase
    .from('proposals')
    .select(`*, milestones(*), profiles:creator_id(id)`) // fetch milestones and creator
    .eq('id', proposalId)
    .single();

  if (error || !proposal) notFound();

  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId || typeof proposal.creator_id !== 'string' || proposal.creator_id !== userId) notFound();

  // Only allow editing if not under_review, approved, or rejected
  if (["under_review", "approved", "rejected"].includes(proposal.status)) notFound();

  // Prepare initial values
  const initialValues = {
    title: proposal.title,
    shortDescription: proposal.short_description || '',
    description: proposal.description,
    type: proposal.type,
    fields: proposal.fields || [],
    skills: proposal.skills_required || [],
    totalPoints: proposal.total_points,
    milestones: (proposal.milestones || []).map((m: any) => ({
      ...m,
      deadline: m.deadline ? new Date(m.deadline).toISOString().split('T')[0] : ''
    })),
  };

  async function handleEditSubmit(data: any) {
    'use server';
    if (!proposal || !proposal.status) {
      throw new Error('Proposal not found or invalid status');
    }
    if (!id) {
      throw new Error('Invalid proposal ID');
    }
    const supabase = createServerComponentClient<Database>({ cookies: () => nextCookies() });
    
    try {
      // Fetch all existing milestone IDs for this proposal
      const { data: existingMilestones, error: fetchMilestonesError } = await supabase
        .from('milestones')
        .select('id')
        .eq('proposal_id', id);
      if (fetchMilestonesError) {
        console.error('Error fetching existing milestones:', fetchMilestonesError);
        throw fetchMilestonesError;
      }
      const existingIds = (existingMilestones || []).map((m: any) => m.id);
      const formIds = data.milestones.filter((m: any) => m.id).map((m: any) => m.id);
      const idsToDelete = existingIds.filter((dbId: string) => !formIds.includes(dbId));
      // Delete milestones not present in the form
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('milestones')
          .delete()
          .in('id', idsToDelete);
        if (deleteError) {
          console.error('Error deleting removed milestones:', deleteError);
          throw deleteError;
        }
      }

      // Update proposal
      const { data: updatedProposal, error: updateError } = await supabase
        .from('proposals')
        .update({
          title: data.title,
          short_description: data.shortDescription,
          description: data.description,
          type: data.type,
          fields: data.fields,
          skills_required: data.skills,
          total_points: data.totalPoints,
          status: proposal.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating proposal:', updateError);
        throw updateError;
      }

      // Update or insert milestones
      for (const m of data.milestones) {
        if (m.id) {
          const { error } = await supabase
            .from('milestones')
            .update({
              title: m.title,
              description: m.description,
              points_allocated: m.points_allocated,
              deadline: m.deadline,
            })
            .eq('id', m.id);
          if (error) {
            console.error('Error updating milestone:', error);
            throw error;
          }
        } else {
          const { error } = await supabase
            .from('milestones')
            .insert({
              proposal_id: id,
              title: m.title,
              description: m.description,
              points_allocated: m.points_allocated,
              deadline: m.deadline,
            } as any);
          if (error) {
            console.error('Error inserting milestone:', error);
            throw error;
          }
        }
      }

      redirect(`/proposals/${id}`);
    } catch (error) {
      console.error('Error in handleEditSubmit:', error);
      throw error;
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <ProposalForm initialValues={initialValues} onSubmit={handleEditSubmit} editMode />
    </div>
  );
} 