-- Add new columns to designers table for enhanced management
ALTER TABLE public.designers
ADD COLUMN IF NOT EXISTS work_fields text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tools text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status text DEFAULT '보통' CHECK (status IN ('바쁨', '여유', '보통')),
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS contact text,
ADD COLUMN IF NOT EXISTS is_part_time boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS part_time_hours integer,
ADD COLUMN IF NOT EXISTS hire_date date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS notes text;

-- Drop the old specialties column if it exists and is empty/unused
-- (keeping it for now in case there's data, but work_fields replaces it)