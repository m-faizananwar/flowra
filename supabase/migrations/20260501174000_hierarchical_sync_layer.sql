-- NEW ARCHITECTURE: Accounts -> Channels -> Messages

-- 1. Ensure integrations table supports multiple accounts per service
-- We will remove the unique constraint on (user_id, service_name) to allow multiple accounts
ALTER TABLE public.integrations DROP CONSTRAINT IF EXISTS integrations_user_id_service_name_key;

-- 2. Create the CHANNELS table (The Sub-Table)
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL, -- Slack/Discord ID
    name TEXT, -- Channel name (e.g. #marketing)
    is_sync_enabled BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(integration_id, external_id)
);

-- 3. Refactor MESSAGES table to link to channels
-- We'll add a channel_id column and eventually migrate away from integration_id
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE;

-- Enable RLS for Channels
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage channels of their integrations"
    ON public.channels
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.integrations 
            WHERE integrations.id = channels.integration_id 
            AND integrations.user_id = auth.uid()
        )
    );

-- Trigger for updated_at on channels
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_channels_updated_at ON public.channels;
CREATE TRIGGER update_channels_updated_at
    BEFORE UPDATE ON public.channels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
