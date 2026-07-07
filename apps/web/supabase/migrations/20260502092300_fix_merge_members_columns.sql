-- SCHEMA HARMONY: Fix merge_members column names
-- Re-defining the function to use 'full_name' instead of 'name'

CREATE OR REPLACE FUNCTION public.merge_members(
    target_member_id UUID, 
    source_member_id UUID,
    new_name TEXT DEFAULT NULL,
    new_alias TEXT DEFAULT NULL
) 
RETURNS VOID AS $$
BEGIN
    -- 1. Safety Check: Don't merge with self
    IF target_member_id = source_member_id THEN
        RETURN;
    END IF;

    -- 2. Transfer all platform links (integration_members)
    UPDATE public.integration_members
    SET member_id = target_member_id
    WHERE member_id = source_member_id;

    -- 3. Update the Primary Human record with the correct column names
    UPDATE public.members
    SET 
        full_name = COALESCE(new_name, full_name),
        alias = COALESCE(new_alias, alias),
        updated_at = now()
    WHERE id = target_member_id;

    -- 4. Delete the duplicate "Ghost" Human
    DELETE FROM public.members
    WHERE id = source_member_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
