-- Explicitly grant insert to anon for matching_requests and add anon insert policy
GRANT INSERT ON TABLE public.matching_requests TO anon;

CREATE POLICY "Anonymous can create matching requests"
ON public.matching_requests
FOR INSERT TO anon
WITH CHECK (true);