-- Adds the hospital simulator, simulator completion rewards, and levels 6-8.

alter table public.ai_simulator_scenarios
add column if not exists max_points integer not null default 100
check (max_points > 0);

create table if not exists public.user_simulator_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id text not null
    references public.ai_simulator_scenarios(id) on delete cascade,
  solved_defects integer not null default 0 check (solved_defects >= 0),
  total_defects integer not null default 0 check (total_defects >= 0),
  completed boolean not null default false,
  points_earned integer not null default 0 check (points_earned >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, scenario_id)
);

alter table public.user_simulator_progress enable row level security;

alter table public.user_gamification
drop constraint if exists user_gamification_level_check;

alter table public.user_gamification
add constraint user_gamification_level_check check (level between 1 and 8);

create or replace function public.qa_level_for_points(p_points integer)
returns table(level integer, level_name text)
language sql
immutable
as $$
  select
    case
      when p_points >= 800 then 8
      when p_points >= 700 then 7
      when p_points >= 600 then 6
      when p_points >= 500 then 5
      when p_points >= 400 then 4
      when p_points >= 250 then 3
      when p_points >= 100 then 2
      else 1
    end,
    case
      when p_points >= 800 then 'QA Architect'
      when p_points >= 700 then 'Quality Engineer'
      when p_points >= 600 then 'Simulator Specialist'
      when p_points >= 500 then 'QA Master'
      when p_points >= 400 then 'QA Specialist'
      when p_points >= 250 then 'Test Analyst'
      when p_points >= 100 then 'Bug Scout'
      else 'QA Trainee'
    end;
$$;

create or replace function public.refresh_user_gamification(p_user_id uuid)
returns public.user_gamification
language plpgsql
security definer
set search_path = public
as $$
declare
  total integer;
  calculated_level integer;
  calculated_name text;
  result public.user_gamification%rowtype;
begin
  select
    coalesce((select sum(points_earned) from public.user_quiz_progress where user_id = p_user_id), 0)
    + coalesce((select sum(points_earned) from public.user_simulator_progress where user_id = p_user_id), 0)
  into total;

  select level, level_name
  into calculated_level, calculated_name
  from public.qa_level_for_points(total);

  insert into public.user_gamification (
    user_id, total_points, level, level_name, updated_at
  )
  values (
    p_user_id, total, calculated_level, calculated_name, now()
  )
  on conflict (user_id) do update
  set
    total_points = excluded.total_points,
    level = excluded.level,
    level_name = excluded.level_name,
    updated_at = excluded.updated_at
  returning * into result;

  return result;
end;
$$;

create or replace function public.record_simulator_progress(
  p_user_id uuid,
  p_scenario_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  scenario_record public.ai_simulator_scenarios%rowtype;
  progress_record public.user_simulator_progress%rowtype;
  gamification_record public.user_gamification%rowtype;
  solved_count integer;
  defect_count integer;
  awarded_points integer := 0;
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  select * into scenario_record
  from public.ai_simulator_scenarios
  where id = p_scenario_id and is_published = true;

  if not found then raise exception 'Simulator not found'; end if;

  select count(*) into defect_count
  from public.ai_simulator_defects
  where scenario_id = p_scenario_id and is_active = true;

  select count(distinct matched_defect_id) into solved_count
  from public.ai_simulator_submissions
  where user_id = p_user_id
    and scenario_id = p_scenario_id
    and verdict = 'correct'
    and matched_defect_id in (
      select id from public.ai_simulator_defects
      where scenario_id = p_scenario_id and is_active = true
    );

  insert into public.user_simulator_progress (user_id, scenario_id)
  values (p_user_id, p_scenario_id)
  on conflict (user_id, scenario_id) do nothing;

  select * into progress_record
  from public.user_simulator_progress
  where user_id = p_user_id and scenario_id = p_scenario_id
  for update;

  if solved_count = defect_count
    and defect_count > 0
    and not progress_record.completed then
    awarded_points := scenario_record.max_points;
  end if;

  update public.user_simulator_progress
  set
    solved_defects = solved_count,
    total_defects = defect_count,
    completed = completed or (solved_count = defect_count and defect_count > 0),
    points_earned = points_earned + awarded_points,
    updated_at = now()
  where user_id = p_user_id and scenario_id = p_scenario_id
  returning * into progress_record;

  gamification_record := public.refresh_user_gamification(p_user_id);

  return jsonb_build_object(
    'solvedDefects', progress_record.solved_defects,
    'totalDefects', progress_record.total_defects,
    'completed', progress_record.completed,
    'pointsAwarded', awarded_points,
    'totalPoints', gamification_record.total_points,
    'level', gamification_record.level,
    'levelName', gamification_record.level_name
  );
end;
$$;

-- Recalculate quiz rewards using both quiz and simulator points.
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
  gamification_record public.user_gamification%rowtype;
  attempt_id uuid;
  score_percent integer;
  target_points integer;
  awarded_points integer;
begin
  if p_total_questions <= 0 or p_score < 0 or p_score > p_total_questions then
    raise exception 'Invalid quiz score';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  select * into quiz_record from public.quizzes
  where id = p_quiz_id and is_published = true;
  if not found then raise exception 'Quiz not found'; end if;

  score_percent := round((p_score::numeric / p_total_questions::numeric) * 100);

  insert into public.user_quiz_progress (user_id, quiz_id)
  values (p_user_id, p_quiz_id)
  on conflict (user_id, quiz_id) do nothing;

  select * into progress_record from public.user_quiz_progress
  where user_id = p_user_id and quiz_id = p_quiz_id for update;

  target_points := case
    when score_percent >= quiz_record.passing_score
      then floor(quiz_record.max_points * p_score::numeric / p_total_questions::numeric)
    else 0
  end;
  awarded_points := greatest(target_points - progress_record.points_earned, 0);

  insert into public.quiz_attempts (
    user_id, quiz_id, score, total_questions, score_percent, points_awarded
  )
  values (
    p_user_id, p_quiz_id, p_score, p_total_questions, score_percent, awarded_points
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

  gamification_record := public.refresh_user_gamification(p_user_id);

  return jsonb_build_object(
    'attemptId', attempt_id,
    'score', p_score,
    'totalQuestions', p_total_questions,
    'scorePercent', score_percent,
    'pointsAwarded', awarded_points,
    'totalPoints', gamification_record.total_points,
    'level', gamification_record.level,
    'levelName', gamification_record.level_name,
    'completed100', score_percent = 100
  );
end;
$$;

revoke all on function public.record_simulator_progress(uuid, text)
from public, anon, authenticated;
revoke all on function public.refresh_user_gamification(uuid)
from public, anon, authenticated;
revoke all on function public.record_quiz_attempt(uuid, text, integer, integer)
from public, anon, authenticated;
grant execute on function public.record_simulator_progress(uuid, text) to service_role;
grant execute on function public.refresh_user_gamification(uuid) to service_role;
grant execute on function public.record_quiz_attempt(uuid, text, integer, integer)
to service_role;

insert into public.ai_simulator_scenarios (
  id, title, instructions, is_published, max_points
)
values (
  'hospital-basic',
  'PrivateMed Hospital Defect Hunt',
  'Inspect the hospital portal and submit one observed defect at a time.',
  true,
  100
)
on conflict (id) do update set
  title = excluded.title,
  instructions = excluded.instructions,
  is_published = true,
  max_points = excluded.max_points;

insert into public.ai_simulator_tasks (
  id, scenario_id, title, description, order_index
)
values
  ('hospital-duplicate-license', 'hospital-basic', 'Doctor data integrity', 'Check whether professional identifiers are unique.', 1),
  ('hospital-unavailable-booking', 'hospital-basic', 'Availability consistency', 'Compare doctor availability with appointment options.', 2),
  ('hospital-department-count', 'hospital-basic', 'Department statistics', 'Validate displayed department totals against doctor records.', 3),
  ('hospital-wrong-announcement', 'hospital-basic', 'Announcement navigation', 'Open announcements and verify the correct content appears.', 4),
  ('hospital-specialty-filter', 'hospital-basic', 'Doctor filtering', 'Test every filter behavior advertised in the doctor directory.', 5),
  ('hospital-booking-submit', 'hospital-basic', 'Appointment submission', 'Complete and submit the appointment workflow.', 6),
  ('hospital-past-date', 'hospital-basic', 'Calendar validation', 'Verify appointment dates follow valid scheduling rules.', 7),
  ('hospital-invalid-contact', 'hospital-basic', 'Contact validation', 'Test whether invalid contact details are rejected.', 8)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index;

insert into public.ai_simulator_defects (
  id, scenario_id, title, evaluation_criteria, feedback_correct
)
values
  ('hospital-duplicate-license', 'hospital-basic', 'Duplicate medical license', 'Doctors Emily Carter and Noah Williams display the same medical license MED-2048. The report must identify the duplicated professional identifier.', 'Correct. Medical license identifiers must be unique to each doctor.'),
  ('hospital-unavailable-booking', 'hospital-basic', 'Unavailable doctor can be booked', 'Dr. Olivia Brown is marked Unavailable but still appears as selectable in the appointment form with available time slots.', 'Correct. An unavailable doctor should not be offered for appointment booking.'),
  ('hospital-department-count', 'hospital-basic', 'Incorrect cardiology doctor count', 'The Cardiology department displays 4 doctors, while the doctor directory contains only 3 cardiologists.', 'Correct. Department statistics must match the doctor directory.'),
  ('hospital-wrong-announcement', 'hospital-basic', 'Announcement opens wrong content', 'Opening the Emergency Entrance Renovation announcement displays the Flu Vaccination Campaign content instead.', 'Correct. Each announcement must open its corresponding details.'),
  ('hospital-specialty-filter', 'hospital-basic', 'Specialty filter does not work', 'The doctor directory advertises name or specialty filtering, but entering a specialty such as Cardiology returns no doctors because only names are searched.', 'Correct. The advertised specialty filtering behavior is not implemented.'),
  ('hospital-booking-submit', 'hospital-basic', 'Appointment submission button does nothing', 'After completing the required appointment fields, clicking Confirm Appointment produces no confirmation and does not create an appointment.', 'Correct. A completed appointment form must provide a successful submission result.'),
  ('hospital-past-date', 'hospital-basic', 'Past appointment date can be selected', 'The appointment calendar allows selecting yesterday even though appointments cannot be scheduled in the past.', 'Correct. Past dates must be disabled for appointment scheduling.'),
  ('hospital-invalid-contact', 'hospital-basic', 'Invalid phone number is accepted', 'The contact form accepts and saves an invalid alphabetic phone number such as abc without validation.', 'Correct. Contact forms must validate phone number format before saving.')
on conflict (id) do update set
  title = excluded.title,
  evaluation_criteria = excluded.evaluation_criteria,
  feedback_correct = excluded.feedback_correct,
  is_active = true;

-- Backfill completion and rewards for simulator work recorded before this migration.
do $$
declare
  submission_record record;
begin
  for submission_record in
    select distinct user_id, scenario_id
    from public.ai_simulator_submissions
    where user_id is not null
  loop
    perform public.record_simulator_progress(
      submission_record.user_id,
      submission_record.scenario_id
    );
  end loop;
end;
$$;

notify pgrst, 'reload schema';
