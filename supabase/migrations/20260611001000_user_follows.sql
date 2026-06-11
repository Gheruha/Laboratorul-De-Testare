-- Adds a private searchable profile index and follower relationships.

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_display_name_lower_idx
  on public.user_profiles (lower(display_name));

create index if not exists user_profiles_email_lower_idx
  on public.user_profiles (lower(email));

create table if not exists public.user_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint user_follows_cannot_follow_self
    check (follower_id <> following_id)
);

create index if not exists user_follows_following_created_idx
  on public.user_follows (following_id, created_at desc);

create index if not exists user_follows_follower_created_idx
  on public.user_follows (follower_id, created_at desc);

alter table public.user_profiles enable row level security;
alter table public.user_follows enable row level security;

-- Search and follow operations go through authenticated server routes.
drop policy if exists "Users can read profiles" on public.user_profiles;
drop policy if exists "Users can read follows" on public.user_follows;
drop policy if exists "Users can create follows" on public.user_follows;
drop policy if exists "Users can delete follows" on public.user_follows;

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
    now()
  )
  on conflict (user_id) do update
  set
    display_name = excluded.display_name,
    email = excluded.email,
    updated_at = excluded.updated_at;

  return new;
end;
$$;

drop trigger if exists sync_user_profile_after_auth_change on auth.users;
create trigger sync_user_profile_after_auth_change
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.sync_user_profile();

insert into public.user_profiles (user_id, display_name, email)
select
  id,
  coalesce(
    nullif(trim(raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(raw_user_meta_data ->> 'name'), ''),
    split_part(email, '@', 1),
    'QA Learner'
  ),
  email
from auth.users
where email is not null
on conflict (user_id) do update
set
  display_name = excluded.display_name,
  email = excluded.email,
  updated_at = now();

notify pgrst, 'reload schema';
