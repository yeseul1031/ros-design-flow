-- Add vacation days tracking to designers table
ALTER TABLE public.designers
ADD COLUMN total_vacation_days integer DEFAULT 15,
ADD COLUMN remaining_vacation_days integer DEFAULT 15;