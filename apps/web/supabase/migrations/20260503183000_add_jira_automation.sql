-- 1. Allow 'jira' in analysis_runs
ALTER TABLE public.analysis_runs 
DROP CONSTRAINT IF EXISTS analysis_runs_analysis_type_check;

ALTER TABLE public.analysis_runs 
ADD CONSTRAINT analysis_runs_analysis_type_check 
CHECK (analysis_type IN ('risk', 'evaluation', 'memory', 'jira'));

-- 2. Allow 'jira_transition' in approval_requests
ALTER TABLE public.approval_requests 
DROP CONSTRAINT IF EXISTS approval_requests_request_type_check;

ALTER TABLE public.approval_requests 
ADD CONSTRAINT approval_requests_request_type_check 
CHECK (request_type IN ('member_evaluation', 'risk_assessment', 'jira_transition'));

-- 3. Add Jira scheduling columns to settings
ALTER TABLE public.analysis_settings 
ADD COLUMN IF NOT EXISTS jira_enabled BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS jira_run_time TIME NOT NULL DEFAULT '18:00';
