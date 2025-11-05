-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view announcements"
ON public.announcements
FOR SELECT
USING (true);

CREATE POLICY "Staff can manage announcements"
ON public.announcements
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for announcement images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('announcements', 'announcements', true);

-- Create storage policies
CREATE POLICY "Anyone can view announcement images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'announcements');

CREATE POLICY "Staff can upload announcement images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'announcements' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)));

CREATE POLICY "Staff can update announcement images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'announcements' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)));

CREATE POLICY "Staff can delete announcement images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'announcements' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)));