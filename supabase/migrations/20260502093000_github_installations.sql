-- GITHUB COMMAND CENTER: Repository Monitoring Schema
-- This migration sets up the tables needed to track GitHub installations and repositories.

-- 1. Table for GitHub Installations (linked to a user's integration)
CREATE TABLE IF NOT EXISTS public.github_repositories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    repo_id BIGINT NOT NULL, -- GitHub's internal ID
    full_name TEXT NOT NULL, -- e.g. "user/repo"
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(integration_id, repo_id)
);

-- 2. Enable RLS
ALTER TABLE public.github_repositories ENABLE ROW LEVEL SECURITY;

-- 3. Policies
CREATE POLICY "Users can view their own repositories"
    ON public.github_repositories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own repositories"
    ON public.github_repositories FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_github_repos_integration ON public.github_repositories(integration_id);
CREATE INDEX IF NOT EXISTS idx_github_repos_user ON public.github_repositories(user_id);
