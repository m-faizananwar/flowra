-- Fix the check constraint on approval_requests to allow Jira transitions
-- This is the root cause of the "Duplicate Cards" issue.

ALTER TABLE public.approval_requests 
DROP CONSTRAINT IF EXISTS approval_requests_request_type_check;

ALTER TABLE public.approval_requests 
ADD CONSTRAINT approval_requests_request_type_check 
CHECK (request_type IN ('member_evaluation', 'risk_assessment', 'jira_transition'));

-- Also ensure the payload column can handle larger JSON
ALTER TABLE public.approval_requests 
ALTER COLUMN payload TYPE JSONB USING payload::jsonb;
