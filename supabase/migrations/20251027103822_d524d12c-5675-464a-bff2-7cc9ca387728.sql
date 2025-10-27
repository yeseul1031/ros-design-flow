-- Create matching_requests table
CREATE TABLE public.matching_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  designer_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  reference_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  additional_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.matching_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own matching requests
CREATE POLICY "Users can view own matching requests"
ON public.matching_requests
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Users can create their own matching requests
CREATE POLICY "Users can create own matching requests"
ON public.matching_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Staff can update matching requests
CREATE POLICY "Staff can update matching requests"
ON public.matching_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_matching_requests_updated_at
BEFORE UPDATE ON public.matching_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Staff can insert notifications
CREATE POLICY "Staff can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR auth.uid() = user_id);