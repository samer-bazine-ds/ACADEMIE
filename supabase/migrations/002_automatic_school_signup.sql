create or replace function public.handle_new_school_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_school_id uuid;
  requested_role text;
  school_name text;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'role', '');

  if requested_role <> 'school' then
    return new;
  end if;

  school_name := nullif(trim(new.raw_user_meta_data ->> 'school_name'), '');
  if school_name is null then
    raise exception 'Le nom de l''école est obligatoire';
  end if;

  insert into public.schools (name, email, owner_user_id)
  values (school_name, new.email, new.id)
  returning id into new_school_id;

  insert into public.profiles (id, role, school_id)
  values (new.id, 'school', new_school_id);

  return new;
end;
$$;

drop trigger if exists on_school_user_created on auth.users;
create trigger on_school_user_created
  after insert on auth.users
  for each row execute function public.handle_new_school_user();

