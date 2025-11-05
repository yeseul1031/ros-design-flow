-- Function to create notifications for all designers when an announcement is created
CREATE OR REPLACE FUNCTION public.create_designer_notifications_on_announcement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert notifications for all users with designer role
  INSERT INTO public.notifications (user_id, title, message, is_read)
  SELECT 
    ur.user_id,
    '[공지] ' || NEW.title,
    NEW.content,
    false
  FROM public.user_roles ur
  WHERE ur.role = 'designer';
  
  RETURN NEW;
END;
$$;

-- Create trigger on announcements table
DROP TRIGGER IF EXISTS trigger_designer_notifications_on_announcement ON public.announcements;
CREATE TRIGGER trigger_designer_notifications_on_announcement
  AFTER INSERT ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.create_designer_notifications_on_announcement();