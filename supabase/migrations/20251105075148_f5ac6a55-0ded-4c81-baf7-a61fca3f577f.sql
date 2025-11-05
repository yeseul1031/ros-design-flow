-- Add pinned column to announcements table
ALTER TABLE public.announcements 
ADD COLUMN is_pinned BOOLEAN NOT NULL DEFAULT false;