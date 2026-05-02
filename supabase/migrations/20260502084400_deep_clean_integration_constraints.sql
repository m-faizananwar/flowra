-- Deep Clean & Constraint Enforcement Patch
-- 1. Identify and remove duplicate profiles before adding the constraint
DELETE FROM public.integration_members a
USING public.integration_members b
WHERE a.id < b.id 
  AND a.integration_id = b.integration_id 
  AND a.external_id = b.external_id;

-- 2. Add the unique constraint safely
DO $$ 
BEGIN
    -- Drop the constraint if it somehow partially exists under a different name
    -- but usually just adding it is enough if we use IF NOT EXISTS logic
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'unique_integration_external_id'
    ) THEN
        ALTER TABLE public.integration_members 
        ADD CONSTRAINT unique_integration_external_id UNIQUE (integration_id, external_id);
    END IF;
END $$;
