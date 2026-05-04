-- FLOWRA: Jira Issues Cache
-- Stores a local copy of Jira card data to avoid repeated API calls
-- and to enrich the AI context with card titles and descriptions.

CREATE TABLE IF NOT EXISTS public.jira_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    project_key TEXT NOT NULL,             -- e.g., FURQAN, SCRUM, ABC
    issue_key TEXT NOT NULL,              -- e.g., FURQAN-15
    issue_type TEXT,                      -- Bug, Story, Task, Epic
    summary TEXT,                         -- Card title
    description TEXT,                     -- Card description (plain text)
    status TEXT,                          -- Current status name
    assignee_name TEXT,
    assignee_account_id TEXT,
    reporter_name TEXT,
    priority TEXT,                        -- Highest, High, Medium, Low
    story_points NUMERIC,
    sprint_name TEXT,                     -- Active sprint name if assigned
    sprint_jira_id BIGINT,               -- Jira Sprint ID
    board_id BIGINT,                      -- Jira Board ID
    labels TEXT[] NOT NULL DEFAULT '{}',
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, issue_key)
);

-- Indexes for fast lookup by project and status
CREATE INDEX IF NOT EXISTS idx_jira_issues_user ON public.jira_issues(user_id, project_key);
CREATE INDEX IF NOT EXISTS idx_jira_issues_key ON public.jira_issues(user_id, issue_key);
CREATE INDEX IF NOT EXISTS idx_jira_issues_status ON public.jira_issues(user_id, status);

-- Enable RLS
ALTER TABLE public.jira_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own jira issues"
    ON public.jira_issues FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER update_jira_issues_updated_at
    BEFORE UPDATE ON public.jira_issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
