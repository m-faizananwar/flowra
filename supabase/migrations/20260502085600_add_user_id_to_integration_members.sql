-- Universal Patch: Add ownership column to integration_members
-- This allows the engine to mark who owns which profile for RLS and UI filtering

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
