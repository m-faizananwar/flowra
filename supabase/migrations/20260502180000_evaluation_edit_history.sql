-- Add edit_history audit trail to member_evaluations and risk_assessments
-- Each entry: { edited_at, edited_by, snapshot: { metric_scores, total_score } / { title, severity, ... } }

ALTER TABLE public.member_evaluations
    ADD COLUMN IF NOT EXISTS edit_history JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.risk_assessments
    ADD COLUMN IF NOT EXISTS edit_history JSONB NOT NULL DEFAULT '[]'::jsonb;
