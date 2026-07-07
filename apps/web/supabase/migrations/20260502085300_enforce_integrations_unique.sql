-- Global Sync Protocol: Enforce Unique Constraints for Integrations
-- 1. Ensure integrations table has the unique constraint
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
