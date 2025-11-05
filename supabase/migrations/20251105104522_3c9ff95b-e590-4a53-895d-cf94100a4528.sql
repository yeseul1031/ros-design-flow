create or replace function public.assign_single_role(target_user_id uuid, new_role app_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (
    public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'manager')
    or (auth.uid() = target_user_id and not public.any_admin_exists() and new_role = 'admin')
  ) then
    raise exception 'not authorized';
  end if;

  delete from public.user_roles where user_id = target_user_id;
  insert into public.user_roles(user_id, role) values (target_user_id, new_role);
end;
$$;

grant execute on function public.assign_single_role(uuid, app_role) to authenticated;