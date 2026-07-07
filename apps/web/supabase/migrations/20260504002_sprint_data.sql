-- FLOWRA: Sprint Data & Metrics
-- Stores sprint history and velocity metrics from Jira
-- to power the Sprint Analytics dashboard page.

CREATE TABLE IF NOT EXISTS public.sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    project_key TEXT NOT NULL,             -- e.g., FURQAN, SCRUM
    jira_sprint_id BIGINT NOT NULL,       -- Jira's numeric Sprint ID
    board_id BIGINT,                      -- Jira Board ID (each project has a board)
    name TEXT NOT NULL,                   -- e.g., "Sprint 3"
    state TEXT NOT NULL DEFAULT 'future' CHECK (state IN ('active', 'closed', 'future')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    complete_date TIMESTAMPTZ,
    goal TEXT,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, jira_sprint_id)
);

CREATE TABLE IF NOT EXISTS public.sprint_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES public.sprints(id) ON DELETE CASCADE,
    total_issues INTEGER NOT NULL DEFAULT 0,
    completed_issues INTEGER NOT NULL DEFAULT 0,
    in_progress_issues INTEGER NOT NULL DEFAULT 0,
    todo_issues INTEGER NOT NULL DEFAULT 0,
    story_points_total NUMERIC NOT NULL DEFAULT 0,
    story_points_completed NUMERIC NOT NULL DEFAULT 0,
    velocity NUMERIC NOT NULL DEFAULT 0,  -- completed / total * 100
    completion_rate NUMERIC NOT NULL DEFAULT 0,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for sprint queries
CREATE INDEX IF NOT EXISTS idx_sprints_user_project ON public.sprints(user_id, project_key, state);
CREATE INDEX IF NOT EXISTS idx_sprints_active ON public.sprints(user_id, state) WHERE state = 'active';
CREATE INDEX IF NOT EXISTS idx_sprint_metrics_sprint ON public.sprint_metrics(sprint_id, calculated_at DESC);

-- Enable RLS
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprint_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sprints"
    ON public.sprints FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own sprint metrics"
    ON public.sprint_metrics FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at for sprints
CREATE TRIGGER update_sprints_updated_at
    BEFORE UPDATE ON public.sprints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
