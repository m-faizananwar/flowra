-- FINAL ENGINE STABILIZATION: Universal Patch
-- This migration consolidates all fixes for Identity, Ownership, and Upsert stability

-- 1. Enforce unique constraint on integrations table (Fixes "ON CONFLICT" error in Dashboard)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'unique_user_service'
    ) THEN
        -- Remove duplicates if any (keeping the newest)
        DELETE FROM public.integrations a
        USING public.integrations b
        WHERE a.id < b.id 
          AND a.user_id = b.user_id 
          AND a.service_name = b.service_name;

        ALTER TABLE public.integrations 
        ADD CONSTRAINT unique_user_service UNIQUE (user_id, service_name);
    END IF;
END $$;

-- 2. Add user_id column to integration_members (Fixes "Could not find user_id" error in Engine)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'integration_members' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.integration_members 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Backfill existing profiles with their integration owner
        UPDATE public.integration_members im
        SET user_id = i.user_id
        FROM public.integrations i
        WHERE im.integration_id = i.id;
    END IF;
END $$;
