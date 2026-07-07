-- FLOWRA INTELLIGENCE ARCHITECTURE
-- Daily risk assessment, member evaluation, layered memory, approval buffer.

-- 1. Scheduling and run bookkeeping
CREATE TABLE IF NOT EXISTS public.analysis_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timezone TEXT NOT NULL DEFAULT 'Asia/Karachi',
    lookback_hours INTEGER NOT NULL DEFAULT 24 CHECK (lookback_hours BETWEEN 1 AND 168),
    risk_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    evaluation_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    risk_run_time TIME NOT NULL DEFAULT '18:00',
    evaluation_run_time TIME NOT NULL DEFAULT '18:30',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.analysis_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('risk', 'evaluation', 'memory')),
    idempotency_key TEXT NOT NULL UNIQUE,
    scheduled_for_date DATE NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'skipped')),
    model TEXT,
    prompt_version TEXT,
    error TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Evidence and memory
CREATE TABLE IF NOT EXISTS public.github_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
    repository_id UUID REFERENCES public.github_repositories(id) ON DELETE SET NULL,
    repo_id BIGINT,
    repo_full_name TEXT,
    event_type TEXT NOT NULL,
    action TEXT,
    delivery_id TEXT,
    sender_login TEXT,
    sender_external_id TEXT,
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    title TEXT,
    url TEXT,
    ref TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_context_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_run_id UUID REFERENCES public.analysis_runs(id) ON DELETE SET NULL,
    chunk_date DATE NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('chat', 'github', 'mixed', 'memory')),
    source_id TEXT,
    channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
    repository_id UUID REFERENCES public.github_repositories(id) ON DELETE SET NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    topic TEXT,
    summary TEXT NOT NULL,
    facts JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
    token_estimate INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_memory_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_run_id UUID REFERENCES public.analysis_runs(id) ON DELETE SET NULL,
    version INTEGER NOT NULL DEFAULT 1,
    project_summary TEXT NOT NULL DEFAULT '',
    completed_work TEXT NOT NULL DEFAULT '',
    remaining_work TEXT NOT NULL DEFAULT '',
    decisions TEXT NOT NULL DEFAULT '',
    open_blockers TEXT NOT NULL DEFAULT '',
    recurring_risks TEXT NOT NULL DEFAULT '',
    source_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Metrics and official/pending outputs
CREATE TABLE IF NOT EXISTS public.evaluation_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    weight NUMERIC(6, 3) NOT NULL DEFAULT 1 CHECK (weight > 0),
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    rubric JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role, member_id, name)
);

CREATE TABLE IF NOT EXISTS public.member_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_run_id UUID REFERENCES public.analysis_runs(id) ON DELETE SET NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    evaluation_date DATE NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    total_score NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (total_score BETWEEN 0 AND 100),
    metric_scores JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary TEXT,
    evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
    model TEXT,
    prompt_version TEXT,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_run_id UUID REFERENCES public.analysis_runs(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    risk_date DATE NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'project',
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    confidence NUMERIC(4, 3) NOT NULL DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),
    affected_member_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    affected_repo_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
    model TEXT,
    prompt_version TEXT,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('member_evaluation', 'risk_assessment')),
    target_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    title TEXT NOT NULL,
    summary TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    body TEXT,
    target_type TEXT,
    target_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Updated-at triggers
DROP TRIGGER IF EXISTS update_analysis_settings_updated_at ON public.analysis_settings;
CREATE TRIGGER update_analysis_settings_updated_at
    BEFORE UPDATE ON public.analysis_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analysis_runs_updated_at ON public.analysis_runs;
CREATE TRIGGER update_analysis_runs_updated_at
    BEFORE UPDATE ON public.analysis_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evaluation_metrics_updated_at ON public.evaluation_metrics;
CREATE TRIGGER update_evaluation_metrics_updated_at
    BEFORE UPDATE ON public.evaluation_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_member_evaluations_updated_at ON public.member_evaluations;
CREATE TRIGGER update_member_evaluations_updated_at
    BEFORE UPDATE ON public.member_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_risk_assessments_updated_at ON public.risk_assessments;
CREATE TRIGGER update_risk_assessments_updated_at
    BEFORE UPDATE ON public.risk_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_approval_requests_updated_at ON public.approval_requests;
CREATE TRIGGER update_approval_requests_updated_at
    BEFORE UPDATE ON public.approval_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Indexes for bounded daily retrieval and pending review queues
CREATE INDEX IF NOT EXISTS idx_analysis_settings_due ON public.analysis_settings(user_id, risk_enabled, evaluation_enabled);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_user_status ON public.analysis_runs(user_id, status, analysis_type);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_window ON public.analysis_runs(user_id, window_start, window_end);
CREATE INDEX IF NOT EXISTS idx_github_events_user_time ON public.github_events(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_github_events_repo_time ON public.github_events(repository_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_github_events_member_time ON public.github_events(member_id, occurred_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_github_events_delivery_unique
    ON public.github_events(integration_id, delivery_id)
    WHERE delivery_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_context_chunks_user_date ON public.daily_context_chunks(user_id, chunk_date, source_type);
CREATE INDEX IF NOT EXISTS idx_project_memory_latest ON public.project_memory_snapshots(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evaluation_metrics_user_role ON public.evaluation_metrics(user_id, role, member_id, is_enabled);
CREATE INDEX IF NOT EXISTS idx_member_evaluations_pending ON public.member_evaluations(user_id, status, evaluation_date DESC);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_pending ON public.risk_assessments(user_id, status, risk_date DESC);
CREATE INDEX IF NOT EXISTS idx_approval_requests_pending ON public.approval_requests(user_id, status, request_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read, created_at DESC);

-- 6. RLS
ALTER TABLE public.analysis_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_context_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_memory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own analysis settings"
    ON public.analysis_settings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own analysis runs"
    ON public.analysis_runs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users view own github events"
    ON public.github_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users view own context chunks"
    ON public.daily_context_chunks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users view own project memory"
    ON public.project_memory_snapshots FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users manage own evaluation metrics"
    ON public.evaluation_metrics FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own member evaluations"
    ON public.member_evaluations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own risk assessments"
    ON public.risk_assessments FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own approval requests"
    ON public.approval_requests FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own notifications"
    ON public.notifications FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
