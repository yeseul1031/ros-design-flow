-- Add response fields to support_tickets table
ALTER TABLE public.support_tickets
ADD COLUMN IF NOT EXISTS response TEXT,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS responded_by UUID REFERENCES auth.users(id);