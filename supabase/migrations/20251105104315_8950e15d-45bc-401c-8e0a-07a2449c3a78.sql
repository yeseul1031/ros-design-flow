-- Create helper to check if any admin exists (avoids recursion in RLS)
create or replace function public.any_admin_exists()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where role = 'admin'::app_role
  );
$$;

-- Allow first authenticated user to self-assign admin ONLY if no admins exist yet
create policy "Bootstrap first admin"
  on public.user_roles
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and role = 'admin'::app_role
    and not public.any_admin_exists()
  );

-- Allow managers to manage roles (in addition to admins)
create policy "Managers can manage roles"
  on public.user_roles
  for all
  to authenticated
  using (public.has_role(auth.uid(), 'manager'))
  with check (public.has_role(auth.uid(), 'manager'));
