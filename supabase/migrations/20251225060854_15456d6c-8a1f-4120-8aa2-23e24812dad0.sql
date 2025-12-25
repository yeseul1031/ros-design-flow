-- Create portfolio_images table for designer matching page
CREATE TABLE public.portfolio_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

-- Everyone can view active portfolio images
CREATE POLICY "Everyone can view active portfolio images"
ON public.portfolio_images
FOR SELECT
USING (is_active = true);

-- Staff can manage portfolio images
CREATE POLICY "Staff can manage portfolio images"
ON public.portfolio_images
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for portfolio bucket
CREATE POLICY "Anyone can view portfolio images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'portfolio');

CREATE POLICY "Staff can upload portfolio images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio' 
  AND (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
  )
);

CREATE POLICY "Staff can update portfolio images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'portfolio' 
  AND (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
  )
);

CREATE POLICY "Staff can delete portfolio images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'portfolio' 
  AND (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_portfolio_images_updated_at
BEFORE UPDATE ON public.portfolio_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();