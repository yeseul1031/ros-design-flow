-- Create vacation_requests table
CREATE TABLE public.vacation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID NOT NULL REFERENCES public.designers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  vacation_type TEXT NOT NULL CHECK (vacation_type IN ('full_day', 'half_day')),
  days_count NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vacation_requests ENABLE ROW LEVEL SECURITY;

-- Designers can view all vacation requests (to see blocked dates)
CREATE POLICY "Designers can view all vacation requests"
ON public.vacation_requests
FOR SELECT
USING (has_role(auth.uid(), 'designer'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Designers can create their own vacation requests
CREATE POLICY "Designers can create own vacation requests"
ON public.vacation_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Staff can update vacation requests
CREATE POLICY "Staff can update vacation requests"
ON public.vacation_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_vacation_requests_updated_at
BEFORE UPDATE ON public.vacation_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();