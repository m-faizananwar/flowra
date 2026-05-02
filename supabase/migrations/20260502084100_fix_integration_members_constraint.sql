-- Stability Patch: Ensure unique constraint for integration_members
-- This allows UPSERT operations to work correctly for identity linking

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'unique_integration_external_id'
    ) THEN
        ALTER TABLE public.integration_members 
        ADD CONSTRAINT unique_integration_external_id UNIQUE (integration_id, external_id);
    END IF;
END $$;
