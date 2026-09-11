-- 0004: User Roles
-- Operational role assignment for each user.
-- A user may have only one active role at a time; the district_id scopes district/field officers.

create table public.user_roles (
  id             uuid                   primary key default extensions.uuid_generate_v4(),
  user_id        uuid                   not null references auth.users (id) on delete cascade,
  role           public.user_role_enum  not null,
  district_id    uuid,                              -- FK added after districts table is created
  is_active      boolean                not null default true,
  approved_by    uuid                   references auth.users (id),
  approved_at    timestamptz,
  created_at     timestamptz            not null default now(),
  unique (user_id)                                 -- one active role per user
);

comment on table public.user_roles is
  'Operational role for each user. Role is enforced server-side; client role is display-only.';
comment on column public.user_roles.district_id is
  'Non-null for field_officer and district_officer; null for control_room (region-wide).';
