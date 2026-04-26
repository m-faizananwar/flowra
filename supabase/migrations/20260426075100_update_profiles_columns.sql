-- Add missing columns to profiles table for onboarding
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS workspace_name TEXT,
ADD COLUMN IF NOT EXISTS goal TEXT,
ADD COLUMN IF NOT EXISTS discovery_source TEXT;
