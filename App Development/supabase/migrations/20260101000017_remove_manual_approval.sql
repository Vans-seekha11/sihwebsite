-- New accounts are active immediately while manual approval is disabled.
alter table public.profiles
  alter column is_active set default true;

update public.profiles
set is_active = true
where is_active = false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;