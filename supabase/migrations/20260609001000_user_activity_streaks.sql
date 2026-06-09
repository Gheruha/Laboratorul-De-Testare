-- Tracks one authenticated activity entry per day and maintains user streaks.

create table if not exists public.user_daily_activity (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null default current_date,
  created_at timestamptz not null default now(),
  primary key (user_id, activity_date)
);

create table if not exists public.user_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_activity_date date,
  updated_at timestamptz not null default now()
);

alter table public.user_daily_activity enable row level security;
alter table public.user_streaks enable row level security;

create or replace function public.record_daily_activity(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := current_date;
  streak_record public.user_streaks%rowtype;
  next_streak integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  insert into public.user_daily_activity (user_id, activity_date)
  values (p_user_id, today)
  on conflict (user_id, activity_date) do nothing;

  select *
  into streak_record
  from public.user_streaks
  where user_id = p_user_id
  for update;

  if not found then
    insert into public.user_streaks (
      user_id,
      current_streak,
      longest_streak,
      last_activity_date
    )
    values (p_user_id, 1, 1, today)
    returning * into streak_record;
  elsif streak_record.last_activity_date = today then
    null;
  else
    next_streak := case
      when streak_record.last_activity_date = today - 1
        then streak_record.current_streak + 1
      else 1
    end;

    update public.user_streaks
    set
      current_streak = next_streak,
      longest_streak = greatest(longest_streak, next_streak),
      last_activity_date = today,
      updated_at = now()
    where user_id = p_user_id
    returning * into streak_record;
  end if;

  return jsonb_build_object(
    'currentStreak', streak_record.current_streak,
    'longestStreak', streak_record.longest_streak,
    'lastActivityDate', streak_record.last_activity_date
  );
end;
$$;

revoke all on function public.record_daily_activity(uuid)
from public, anon, authenticated;
grant execute on function public.record_daily_activity(uuid) to service_role;

notify pgrst, 'reload schema';
