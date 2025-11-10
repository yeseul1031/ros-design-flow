-- Add end_date_history column to projects table to track end date changes
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS end_date_history jsonb DEFAULT '[]'::jsonb;