-- Recreate policy to allow designers to view customer names for assigned projects
DROP POLICY IF EXISTS "Designers can view assigned customer profiles" ON public.profiles;

CREATE POLICY "Designers can view assigned customer profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.projects p
    JOIN public.designers d ON d.id = p.assigned_designer_id
    WHERE p.user_id = profiles.id
      AND d.user_id = auth.uid()
  )
);