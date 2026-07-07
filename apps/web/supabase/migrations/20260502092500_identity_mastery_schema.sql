-- IDENTITY MASTERY: Add missing alias column and fix merge function
-- 1. Add the alias column that the engine expects
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS alias TEXT;
COMMENT ON COLUMN public.members.alias IS 'The team-specific alias or username (e.g., @neoninja).';

-- 2. Correct the merge_members function to use the final schema
CREATE OR REPLACE FUNCTION public.merge_members(
    target_member_id UUID, 
    source_member_id UUID,
    new_name TEXT DEFAULT NULL,
    new_alias TEXT DEFAULT NULL
) 
RETURNS VOID AS $$
BEGIN
    IF target_member_id = source_member_id THEN RETURN; END IF;

    -- Transfer links
    UPDATE public.integration_members SET member_id = target_member_id WHERE member_id = source_member_id;

    -- Update Primary record with correct columns (full_name and alias)
    UPDATE public.members SET 
        full_name = COALESCE(new_name, full_name),
        alias = COALESCE(new_alias, alias),
        updated_at = now()
    WHERE id = target_member_id;

    -- Delete Ghost
    DELETE FROM public.members WHERE id = source_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
