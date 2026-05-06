-- Add 'executed' status to approval_requests
ALTER TABLE public.approval_requests 
DROP CONSTRAINT IF EXISTS approval_requests_status_check;

ALTER TABLE public.approval_requests 
ADD CONSTRAINT approval_requests_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'executed'));
