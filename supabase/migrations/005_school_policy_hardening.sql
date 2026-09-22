drop policy if exists school_access on public.schools;
create policy school_admin_access on public.schools for all using(id=my_school() and is_school_admin()) with check(id=my_school() and is_school_admin());
create policy school_parent_read on public.schools for select using(id=my_school());
