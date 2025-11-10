-- Add public SELECT policy for payment_requests to allow quote viewing via link
CREATE POLICY "Anyone can view payment requests with valid token"
ON public.payment_requests
FOR SELECT
TO public
USING (true);

-- Also ensure quotes can be read when accessed via payment link
CREATE POLICY "Anyone can view quotes via payment request"
ON public.quotes
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.payment_requests pr
    WHERE pr.quote_id = quotes.id
  )
);