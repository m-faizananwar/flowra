-- Migration: Add role column to members table
-- Description: Allows specifying professional titles (Architect, Engineer, etc.) for each unique identity.

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS role TEXT;

-- Update the view/policy if necessary (members are already under user_id control)
COMMENT ON COLUMN public.members.role IS 'The professional title or role of the member (e.g., Software Engineer, Architect).';
