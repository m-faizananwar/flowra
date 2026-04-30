-- Create the messages table for Flowra
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    external_message_id TEXT NOT NULL,
    sender_name TEXT,
    content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    synced_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(integration_id, external_message_id)
);

-- Enable Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own messages
CREATE POLICY "Users can view their own messages"
    ON public.messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.integrations
            WHERE public.integrations.id = public.messages.integration_id
            AND public.integrations.user_id = auth.uid()
        )
    );
