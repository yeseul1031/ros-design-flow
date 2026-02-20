
ALTER TABLE public.portfolio_images ADD COLUMN search_tags text[] DEFAULT '{}'::text[];
