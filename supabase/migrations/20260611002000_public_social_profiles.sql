-- Adds Auth avatar synchronization for privacy-limited public profiles.

alter table public.user_profiles
add column if not exists avatar_url text;

create or replace function public.sync_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null then
    delete from public.user_profiles where user_id = new.id;
    return new;
  end if;

  insert into public.user_profiles (
    user_id,
    display_name,
    email,
    avatar_url,
    updated_at
  )
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1),
      'QA Learner'
    ),
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'picture'), '')
    ),
    now()
  )
  on conflict (user_id) do update
  set
    display_name = excluded.display_name,
    email = excluded.email,
    avatar_url = excluded.avatar_url,
    updated_at = excluded.updated_at;

  return new;
end;
$$;

insert into public.user_profiles (user_id, display_name, email, avatar_url)
select
  id,
  coalesce(
    nullif(trim(raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(raw_user_meta_data ->> 'name'), ''),
    split_part(email, '@', 1),
    'QA Learner'
  ),
  email,
  coalesce(
    nullif(trim(raw_user_meta_data ->> 'avatar_url'), ''),
    nullif(trim(raw_user_meta_data ->> 'picture'), '')
  )
from auth.users
where email is not null
on conflict (user_id) do update
set
  display_name = excluded.display_name,
  email = excluded.email,
  avatar_url = excluded.avatar_url,
  updated_at = now();

notify pgrst, 'reload schema';
