-- Step 1: Make user_id nullable and add contact fields
ALTER TABLE public.matching_requests 
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.matching_requests 
  ADD COLUMN IF NOT EXISTS brand_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Step 2: Remove all existing INSERT policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create own matching requests" ON public.matching_requests;
DROP POLICY IF EXISTS "Anyone can create matching requests" ON public.matching_requests;
DROP POLICY IF EXISTS "Anonymous can create matching requests" ON public.matching_requests;

-- Step 3: Create a simple INSERT policy that allows everyone (authenticated and anonymous)
CREATE POLICY "Allow all inserts"
ON public.matching_requests
FOR INSERT
WITH CHECK (true);

-- Step 4: Update SELECT policy
DROP POLICY IF EXISTS "Users can view own matching requests" ON public.matching_requests;

CREATE POLICY "Users can view own matching requests"
ON public.matching_requests
FOR SELECT
USING (
  (user_id IS NOT NULL AND auth.uid() = user_id) 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
);
