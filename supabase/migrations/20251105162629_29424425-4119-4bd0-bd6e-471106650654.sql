-- Remove default values for new designers (keep only essential fields)
ALTER TABLE public.designers 
  ALTER COLUMN hire_date DROP DEFAULT,
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN total_vacation_days DROP DEFAULT,
  ALTER COLUMN remaining_vacation_days DROP DEFAULT;

-- Make these columns nullable
ALTER TABLE public.designers 
  ALTER COLUMN hire_date DROP NOT NULL,
  ALTER COLUMN total_vacation_days DROP NOT NULL,
  ALTER COLUMN remaining_vacation_days DROP NOT NULL;