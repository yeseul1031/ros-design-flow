-- Add contact fields to matching_requests table and make user_id nullable
ALTER TABLE public.matching_requests 
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS brand_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_phone TEXT NOT NULL DEFAULT '';

-- Update existing policies to handle nullable user_id
DROP POLICY IF EXISTS "Users can view own matching requests" ON public.matching_requests;

CREATE POLICY "Users can view own matching requests"
ON public.matching_requests
FOR SELECT
USING (
  (user_id IS NOT NULL AND auth.uid() = user_id) 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- Allow anyone (including anonymous users) to create matching requests
DROP POLICY IF EXISTS "Anyone can create matching requests" ON public.matching_requests;
DROP POLICY IF EXISTS "Users can create own matching requests" ON public.matching_requests;

CREATE POLICY "Anyone can create matching requests"
ON public.matching_requests
FOR INSERT
WITH CHECK (true);
