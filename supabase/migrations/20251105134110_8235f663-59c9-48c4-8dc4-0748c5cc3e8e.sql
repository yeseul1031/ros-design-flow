-- Create or replace function to create designer record when role assigned
CREATE OR REPLACE FUNCTION public.handle_designer_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  existing uuid;
  prof RECORD;
BEGIN
  IF NEW.role = 'designer' THEN
    SELECT id INTO existing FROM public.designers WHERE user_id = NEW.user_id;
    IF existing IS NULL THEN
      SELECT name, email INTO prof FROM public.profiles WHERE id = NEW.user_id;
      INSERT INTO public.designers (user_id, name, contact)
      VALUES (NEW.user_id, COALESCE(prof.name, split_part(prof.email, '@', 1)), prof.email);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Ensure trigger exists on user_roles after insert
DROP TRIGGER IF EXISTS on_designer_role_assigned ON public.user_roles;
CREATE TRIGGER on_designer_role_assigned
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.handle_designer_role_assignment();