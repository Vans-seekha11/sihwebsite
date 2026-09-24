-- Allow authenticated users to update their own profile and role assignment.

create policy "user_roles: own update"
  on public.user_roles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
