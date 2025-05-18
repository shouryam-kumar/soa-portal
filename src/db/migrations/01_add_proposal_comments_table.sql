-- Create proposal_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.proposal_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT proposal_comments_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(id),
  CONSTRAINT proposal_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Add index for faster lookups by proposal_id
CREATE INDEX IF NOT EXISTS proposal_comments_proposal_id_idx ON public.proposal_comments(proposal_id);

-- Add index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS proposal_comments_user_id_idx ON public.proposal_comments(user_id);

-- Add security policies
ALTER TABLE public.proposal_comments ENABLE ROW LEVEL SECURITY;

-- Allow users to read all comments
CREATE POLICY "Anyone can view proposal comments"
  ON public.proposal_comments FOR SELECT
  USING (true);

-- Allow authenticated users to create comments
CREATE POLICY "Authenticated users can create comments"
  ON public.proposal_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update own comments"
  ON public.proposal_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.proposal_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to manage all comments
CREATE POLICY "Admins can manage all comments"
  ON public.proposal_comments
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  ); 