-- Add edit_history to risk_assessments for audit trail consistency
ALTER TABLE public.risk_assessments ADD COLUMN IF NOT EXISTS edit_history JSONB DEFAULT '[]'::jsonb;

-- Ensure recommendations is JSONB (already is, but good to keep track)
-- No changes needed if already correct.
