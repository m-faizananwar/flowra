-- IDENTITY FUSION: Enforce Cascade Deletion and Cleanup
-- 1. Update foreign key to CASCADE so deleting a Human deletes their platform links
ALTER TABLE public.integration_members
DROP CONSTRAINT IF EXISTS integration_members_member_id_fkey,
ADD CONSTRAINT integration_members_member_id_fkey 
    FOREIGN KEY (member_id) 
    REFERENCES public.members(id) 
    ON DELETE CASCADE;

-- 2. Clean up any "Orphaned" identities that were left behind
DELETE FROM public.integration_members 
WHERE member_id IS NOT NULL 
AND member_id NOT IN (SELECT id FROM public.members);
