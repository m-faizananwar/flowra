-- Identity Layer Migration
-- Stores "Human" identities across multiple integrations

-- 1. Create the 'members' table (The "Human" identity)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT, -- The "Alias" or preferred name
    avatar_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the 'integration_members' table (Platform-specific profiles)
CREATE TABLE IF NOT EXISTS public.integration_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL, -- Link to the "Human"
    external_id TEXT NOT NULL, -- Discord ID, Slack ID, etc.
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(integration_id, external_id)
);

-- 3. Add RLS Policies
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view members of their account" ON public.members;
CREATE POLICY "Users can view members of their account"
    ON public.members FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update members of their account" ON public.members;
CREATE POLICY "Users can update members of their account"
    ON public.members FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view integration members" ON public.integration_members;
CREATE POLICY "Users can view integration members"
    ON public.integration_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.integrations
            WHERE public.integrations.id = public.integration_members.integration_id
            AND public.integrations.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Engine can manage integration members" ON public.integration_members;
CREATE POLICY "Engine can manage integration members"
    ON public.integration_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.integrations
            WHERE public.integrations.id = public.integration_members.integration_id
            AND public.integrations.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view integration_members via integration ownership" ON public.integration_members;
CREATE POLICY "Users can view integration_members via integration ownership"
    ON public.integration_members FOR SELECT
    USING (integration_id IN (
        SELECT id FROM public.integrations 
        WHERE user_id = auth.uid()
    ));

-- 4. Create Indexes
CREATE INDEX IF NOT EXISTS idx_integration_members_ext_id ON public.integration_members(external_id);
CREATE INDEX IF NOT EXISTS idx_integration_members_int_id ON public.integration_members(integration_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
