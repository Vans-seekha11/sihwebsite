-- Self-registration is active immediately and assigns the requested role.

alter table public.profiles
  alter column is_active set default true;

update public.profiles
set is_active = true
where is_active = false;

alter table public.user_roles
  drop column if exists approved_by,
  drop column if exists approved_at;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  requested_role public.user_role_enum;
  requested_district_id uuid;
  requested_district text;
begin
  requested_role := case new.raw_user_meta_data->>'requested_role'
    when 'field_officer' then 'field_officer'::public.user_role_enum
    when 'district_officer' then 'district_officer'::public.user_role_enum
    when 'control_room' then 'control_room'::public.user_role_enum
    else null
  end;

  requested_district := new.raw_user_meta_data->>'district';

  if requested_role is not null and requested_role <> 'control_room'::public.user_role_enum then
    select id
    into requested_district_id
    from public.locations
    where name = requested_district
       or district = requested_district
       or state = requested_district
    order by (location_type = 'district_hq') desc
    limit 1;
  end if;

  insert into public.profiles (id, full_name, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    true
  )
  on conflict (id) do update
    set is_active = true;

  if requested_role is not null then
    insert into public.user_roles (user_id, role, district_id, is_active)
    values (new.id, requested_role, requested_district_id, true)
    on conflict (user_id) do update
      set role = excluded.role,
          district_id = excluded.district_id,
          is_active = true;
  end if;

  return new;
end;
$$;
