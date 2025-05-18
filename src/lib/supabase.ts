import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

// Client-side Supabase client (for components with 'use client')
export const createClient = () => {
  return createClientComponentClient<Database>();
};

// Helper function to check if a user is authenticated on the client
export const isAuthenticated = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  return { isAuth: !!data.session, user: data.session?.user };
};

// Helper function to get user profile
export const getUserProfile = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};

// Helper function to check if user is admin
export const isAdmin = async (userId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }

  return !!data?.is_admin;
};

// Helper function to get all proposals
export const getProposals = async (status?: string) => {
  const supabase = createClient();
  let query = supabase
    .from('proposals')
    .select(`
      *,
      profiles:creator_id(username, avatar_url),
      milestones(*)
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching proposals:', error);
    return [];
  }

  return data;
};

// Helper function to get a single proposal by ID
export const getProposalById = async (id: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      profiles:creator_id(id, username, avatar_url, bio, wallet_address),
      milestones(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching proposal:', error);
    return null;
  }

  return data;
};

// Helper function to get all projects
export const getProjects = async (status?: string) => {
  const supabase = createClient();
  let query = supabase
    .from('projects')
    .select(`
      *,
      proposals(*),
      profiles:leader_id(username, avatar_url),
      project_members(
        profiles:user_id(id, username, avatar_url)
      )
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data;
};

// Helper function to get a single project by ID
export const getProjectById = async (id: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      proposals(
        *,
        milestones(*)
      ),
      profiles:leader_id(id, username, avatar_url, bio, wallet_address),
      project_members(
        profiles:user_id(id, username, avatar_url)
      ),
      project_updates(
        *,
        profiles:posted_by(username, avatar_url)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  return data;
};

// Helper function to create a new proposal
export const createProposal = async (proposalData: any) => {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  // First, create the proposal
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .insert({
      title: proposalData.title,
      short_description: proposalData.shortDescription,
      description: proposalData.description,
      creator_id: userData.user.id,
      type: proposalData.type,
      fields: proposalData.fields,
      skills_required: proposalData.skillsRequired,
      total_points: proposalData.totalPoints,
      status: proposalData.status || 'draft'
    })
    .select()
    .single();

  if (proposalError) {
    console.error('Error creating proposal:', proposalError);
    throw proposalError;
  }

  // Then, create the milestones
  if (proposalData.milestones && proposalData.milestones.length > 0) {
    const milestonesWithProposalId = proposalData.milestones.map((milestone: any) => ({
      ...milestone,
      proposal_id: proposal.id
    }));

    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .insert(milestonesWithProposalId);

    if (milestonesError) {
      console.error('Error creating milestones:', milestonesError);
      // Consider whether to roll back the proposal here
    }
  }

  return proposal;
};

// Helper function to update a proposal
export const updateProposal = async (id: string, proposalData: any) => {
  const supabase = createClient();
  
  console.log('Starting proposal update for ID:', id);
  console.log('Update data:', proposalData);
  
  // First check if proposal exists
  const { data: existingProposal, error: checkError } = await supabase
    .from('proposals')
    .select('id')
    .eq('id', id)
    .single();

  if (checkError) {
    console.error('Error checking proposal:', checkError);
    throw new Error('Proposal not found');
  }

  console.log('Found existing proposal:', existingProposal);

  // Then perform the update
  const updatePayload = {
    title: proposalData.title,
    short_description: proposalData.shortDescription,
    description: proposalData.description,
    type: proposalData.type,
    fields: proposalData.fields,
    skills_required: proposalData.skillsRequired,
    total_points: proposalData.totalPoints,
    status: proposalData.status,
    review_feedback: proposalData.reviewFeedback,
    updated_at: new Date().toISOString()
  };

  console.log('Update payload:', updatePayload);

  const { data, error } = await supabase
    .from('proposals')
    .update(updatePayload)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating proposal:', error);
    throw error;
  }

  console.log('Update response:', { data, error });

  if (!data || data.length === 0) {
    console.error('Update returned no data:', { id, updatePayload });
    throw new Error('Failed to update proposal');
  }

  return data[0];
};

// Helper function to change proposal status
export const changeProposalStatus = async (id: string, status: string, feedback?: string) => {
  const supabase = createClient();
  const updateData: any = { 
    status,
    updated_at: new Date().toISOString()
  };
  
  if (feedback) {
    updateData.review_feedback = feedback;
  }
  
  const { data, error } = await supabase
    .from('proposals')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating proposal status:', error);
    throw error;
  }

  // If approved, create a project
  if (status === 'approved') {
    try {
      await supabase.rpc('create_project_from_proposal', { proposal_uuid: id });
    } catch (projectError) {
      console.error('Error creating project:', projectError);
    }
  }

  return data;
};

// Helper function to add a comment to a proposal
export const addProposalComment = async (proposalId: string, content: string) => {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('proposal_comments')
    .insert({
      proposal_id: proposalId,
      user_id: userData.user.id,
      content
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw error;
  }

  return data;
};

// Helper function to get comments for a proposal
export const getProposalComments = async (proposalId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('proposal_comments')
    .select(`
      *,
      profiles:user_id(id, username, avatar_url, is_admin)
    `)
    .eq('proposal_id', proposalId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  return data;
};

// Helper function to get user notifications
export const getUserNotifications = async (limit: number = 10) => {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    return [];
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data;
};

// Helper function to mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }

  return data;
};

// Helper function to submit a milestone deliverable
export const submitMilestoneDeliverable = async (milestoneId: string, submissionData: any) => {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('submissions')
    .insert({
      milestone_id: milestoneId,
      submitted_by: userData.user.id,
      content: submissionData.content,
      links: submissionData.links
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting milestone:', error);
    throw error;
  }

  return data;
};

// Helper function to approve a milestone submission
export const approveMilestoneSubmission = async (submissionId: string, feedback: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('submissions')
    .update({
      approved: true,
      feedback,
      updated_at: new Date().toISOString()
    })
    .eq('id', submissionId)
    .select()
    .single();

  if (error) {
    console.error('Error approving submission:', error);
    throw error;
  }

  // Get the milestone
  const { data: milestone, error: milestoneError } = await supabase
    .from('milestones')
    .select('*')
    .eq('id', data.milestone_id)
    .single();

  if (milestoneError) {
    console.error('Error fetching milestone:', milestoneError);
    throw milestoneError;
  }

  // Update the milestone as completed
  const { error: updateError } = await supabase
    .from('milestones')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      feedback
    })
    .eq('id', data.milestone_id);

  if (updateError) {
    console.error('Error updating milestone:', updateError);
    throw updateError;
  }

  // Get the project to update points distributed
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('proposal_id', milestone.proposal_id)
    .single();

  if (!projectError && project) {
    // Update points distributed
    const { error: pointsError } = await supabase
      .from('projects')
      .update({
        points_distributed: (project.points_distributed || 0) + milestone.points_allocated
      })
      .eq('id', project.id);

    if (pointsError) {
      console.error('Error updating project points:', pointsError);
    }

    // Update user's points
    const { error: userPointsError } = await supabase.rpc('increment_points', {
      user_uuid: data.submitted_by,
      points: milestone.points_allocated
    });

    if (userPointsError) {
      console.error('Error updating user points:', userPointsError);
    }
  }

  return data;
};