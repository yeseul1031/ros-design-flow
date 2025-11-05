-- Create function to automatically create designer record when designer role is assigned
CREATE OR REPLACE FUNCTION public.handle_designer_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Only proceed if the role being assigned is 'designer'
  IF NEW.role = 'designer' THEN
    -- Get user profile information
    SELECT id, name, email INTO user_profile
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Check if designer record already exists
    IF NOT EXISTS (SELECT 1 FROM public.designers WHERE user_id = NEW.user_id) THEN
      -- Create designer record with default vacation days
      INSERT INTO public.designers (
        user_id,
        name,
        hire_date,
        total_vacation_days,
        remaining_vacation_days,
        is_available,
        status
      ) VALUES (
        NEW.user_id,
        COALESCE(user_profile.name, user_profile.email),
        CURRENT_DATE,
        15,
        15,
        true,
        '보통'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for designer role assignment
DROP TRIGGER IF EXISTS on_designer_role_assigned ON public.user_roles;
CREATE TRIGGER on_designer_role_assigned
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_designer_role_assignment();

-- Create function to handle vacation approval and deduct vacation days
CREATE OR REPLACE FUNCTION public.handle_vacation_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only proceed if status changed to 'approved'
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Deduct vacation days from designer's remaining vacation days
    UPDATE public.designers
    SET remaining_vacation_days = remaining_vacation_days - NEW.days_count
    WHERE id = NEW.designer_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for vacation approval
DROP TRIGGER IF EXISTS on_vacation_approved ON public.vacation_requests;
CREATE TRIGGER on_vacation_approved
  AFTER UPDATE ON public.vacation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_vacation_approval();