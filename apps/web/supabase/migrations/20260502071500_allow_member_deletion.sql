-- Add DELETE policy to members table
-- This allows users to clean up empty identities

DROP POLICY IF EXISTS "Users can delete members of their account" ON public.members;
CREATE POLICY "Users can delete members of their account"
    ON public.members FOR DELETE
    USING (auth.uid() = user_id);
