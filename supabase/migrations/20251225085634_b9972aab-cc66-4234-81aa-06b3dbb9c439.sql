-- Create survey_responses table for satisfaction survey
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  
  -- Survey responses
  overall_satisfaction INTEGER CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 5),
  designer_satisfaction INTEGER CHECK (designer_satisfaction >= 1 AND designer_satisfaction <= 5),
  communication_satisfaction INTEGER CHECK (communication_satisfaction >= 1 AND communication_satisfaction <= 5),
  would_reuse BOOLEAN,
  would_recommend INTEGER CHECK (would_recommend >= 0 AND would_recommend <= 10), -- NPS score
  improvement_feedback TEXT,
  
  -- Metadata
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Customer info (for reference)
  customer_name TEXT,
  customer_email TEXT,
  customer_company TEXT
);

-- Enable RLS
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view their survey by token (for survey page)
CREATE POLICY "Anyone can view survey by token"
ON public.survey_responses
FOR SELECT
USING (true);

-- Policy: Anyone can update survey by token (for submitting responses)
CREATE POLICY "Anyone can submit survey response"
ON public.survey_responses
FOR UPDATE
USING (token IS NOT NULL AND submitted_at IS NULL);

-- Policy: Staff can view all survey responses
CREATE POLICY "Staff can manage survey responses"
ON public.survey_responses
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_survey_responses_updated_at
BEFORE UPDATE ON public.survey_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();