-- Stores quiz attempts and awards cumulative points without allowing duplicate rewards.

alter table public.quizzes
add column if not exists max_points integer not null default 100
check (max_points > 0);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id text not null references public.quizzes(id) on delete cascade,
  score integer not null check (score >= 0),
  total_questions integer not null check (total_questions > 0),
  score_percent integer not null check (score_percent between 0 and 100),
  points_awarded integer not null default 0 check (points_awarded >= 0),
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_user_quiz_created_idx
  on public.quiz_attempts (user_id, quiz_id, created_at desc);

create table if not exists public.user_quiz_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id text not null references public.quizzes(id) on delete cascade,
  best_score_percent integer not null default 0
    check (best_score_percent between 0 and 100),
  points_earned integer not null default 0 check (points_earned >= 0),
  completed_100 boolean not null default false,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, quiz_id)
);

create table if not exists public.user_gamification (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_points integer not null default 0 check (total_points >= 0),
  level integer not null default 1 check (level between 1 and 5),
  level_name text not null default 'QA Trainee',
  updated_at timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;
alter table public.user_quiz_progress enable row level security;
alter table public.user_gamification enable row level security;

-- Reads and writes go through authenticated server routes using the service role.
drop policy if exists "Users can read own quiz attempts" on public.quiz_attempts;
drop policy if exists "Users can read own quiz progress" on public.user_quiz_progress;
drop policy if exists "Users can read own gamification" on public.user_gamification;

create or replace function public.record_quiz_attempt(
  p_user_id uuid,
  p_quiz_id text,
  p_score integer,
  p_total_questions integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  quiz_record public.quizzes%rowtype;
  progress_record public.user_quiz_progress%rowtype;
  attempt_id uuid;
  score_percent integer;
  target_points integer;
  awarded_points integer;
  new_total integer;
  new_level integer;
  new_level_name text;
begin
  if p_total_questions <= 0 or p_score < 0 or p_score > p_total_questions then
    raise exception 'Invalid quiz score';
  end if;

  -- Serialize attempts for one user so simultaneous quiz submissions cannot
  -- leave the aggregate total behind the per-quiz totals.
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  select *
  into quiz_record
  from public.quizzes
  where id = p_quiz_id and is_published = true;

  if not found then
    raise exception 'Quiz not found';
  end if;

  score_percent := round((p_score::numeric / p_total_questions::numeric) * 100);

  insert into public.user_quiz_progress (user_id, quiz_id)
  values (p_user_id, p_quiz_id)
  on conflict (user_id, quiz_id) do nothing;

  select *
  into progress_record
  from public.user_quiz_progress
  where user_id = p_user_id and quiz_id = p_quiz_id
  for update;

  target_points := case
    when score_percent >= quiz_record.passing_score
      then floor(quiz_record.max_points * p_score::numeric / p_total_questions::numeric)
    else 0
  end;
  awarded_points := greatest(target_points - progress_record.points_earned, 0);

  insert into public.quiz_attempts (
    user_id,
    quiz_id,
    score,
    total_questions,
    score_percent,
    points_awarded
  )
  values (
    p_user_id,
    p_quiz_id,
    p_score,
    p_total_questions,
    score_percent,
    awarded_points
  )
  returning id into attempt_id;

  update public.user_quiz_progress
  set
    best_score_percent = greatest(best_score_percent, score_percent),
    points_earned = points_earned + awarded_points,
    completed_100 = completed_100 or score_percent = 100,
    attempt_count = attempt_count + 1,
    updated_at = now()
  where user_id = p_user_id and quiz_id = p_quiz_id;

  select coalesce(sum(points_earned), 0)
  into new_total
  from public.user_quiz_progress
  where user_id = p_user_id;

  new_level := case
    when new_total >= 500 then 5
    when new_total >= 400 then 4
    when new_total >= 250 then 3
    when new_total >= 100 then 2
    else 1
  end;
  new_level_name := case new_level
    when 5 then 'QA Master'
    when 4 then 'QA Specialist'
    when 3 then 'Test Analyst'
    when 2 then 'Bug Scout'
    else 'QA Trainee'
  end;

  insert into public.user_gamification (
    user_id,
    total_points,
    level,
    level_name,
    updated_at
  )
  values (p_user_id, new_total, new_level, new_level_name, now())
  on conflict (user_id) do update
  set
    total_points = excluded.total_points,
    level = excluded.level,
    level_name = excluded.level_name,
    updated_at = excluded.updated_at;

  return jsonb_build_object(
    'attemptId', attempt_id,
    'score', p_score,
    'totalQuestions', p_total_questions,
    'scorePercent', score_percent,
    'pointsAwarded', awarded_points,
    'totalPoints', new_total,
    'level', new_level,
    'levelName', new_level_name,
    'completed100', score_percent = 100
  );
end;
$$;

revoke all on function public.record_quiz_attempt(uuid, text, integer, integer)
from public, anon, authenticated;
grant execute on function public.record_quiz_attempt(uuid, text, integer, integer)
to service_role;

notify pgrst, 'reload schema';
