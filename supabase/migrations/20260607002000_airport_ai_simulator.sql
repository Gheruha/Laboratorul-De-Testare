-- Database-backed, tightly scoped AI evaluation for the airport simulator.

create table if not exists public.ai_simulator_scenarios (
  id text primary key,
  title text not null,
  instructions text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_simulator_tasks (
  id text primary key,
  scenario_id text not null
    references public.ai_simulator_scenarios(id) on delete cascade,
  title text not null,
  description text not null,
  order_index integer not null check (order_index > 0),
  unique (scenario_id, order_index)
);

create table if not exists public.ai_simulator_defects (
  id text primary key,
  scenario_id text not null
    references public.ai_simulator_scenarios(id) on delete cascade,
  title text not null,
  evaluation_criteria text not null,
  feedback_correct text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_simulator_submissions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid references auth.users(id) on delete set null,
  scenario_id text not null
    references public.ai_simulator_scenarios(id) on delete cascade,
  report text not null check (char_length(report) between 20 and 600),
  verdict text not null
    check (verdict in ('correct', 'incorrect', 'out_of_scope')),
  matched_defect_id text
    references public.ai_simulator_defects(id) on delete set null,
  feedback text not null,
  created_at timestamptz not null default now()
);

alter table public.ai_simulator_submissions
add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists ai_simulator_submissions_session_created_idx
on public.ai_simulator_submissions (session_id, created_at desc);

create index if not exists ai_simulator_submissions_user_created_idx
on public.ai_simulator_submissions (user_id, created_at desc);

alter table public.ai_simulator_scenarios enable row level security;
alter table public.ai_simulator_tasks enable row level security;
alter table public.ai_simulator_defects enable row level security;
alter table public.ai_simulator_submissions enable row level security;

insert into public.ai_simulator_scenarios (id, title, instructions)
values (
  'airport-basic',
  'Airport Website Defect Hunt',
  'Inspect the airport website and submit one observed defect at a time.'
)
on conflict (id) do update
set
  title = excluded.title,
  instructions = excluded.instructions,
  is_published = true;

insert into public.ai_simulator_tasks (
  id,
  scenario_id,
  title,
  description,
  order_index
)
values
  (
    'airport-duplicate-flight',
    'airport-basic',
    'Departure data integrity',
    'Inspect departure records for identifiers that should be unique.',
    1
  ),
  (
    'airport-cancelled-gate',
    'airport-basic',
    'Status consistency',
    'Verify that operational details agree with each flight status.',
    2
  ),
  (
    'airport-landed-belt',
    'airport-basic',
    'Arrival information completeness',
    'Inspect whether completed arrivals provide the information passengers need.',
    3
  ),
  (
    'airport-belt-announcement',
    'airport-basic',
    'Cross-section consistency',
    'Compare announcements with the information displayed elsewhere.',
    4
  ),
  (
    'airport-invalid-hours',
    'airport-basic',
    'Service information validity',
    'Validate the values displayed in airport service information.',
    5
  ),
  (
    'airport-city-search',
    'airport-basic',
    'Search behavior',
    'Test every type of search advertised by the search field.',
    6
  )
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index;

insert into public.ai_simulator_defects (
  id,
  scenario_id,
  title,
  evaluation_criteria,
  feedback_correct
)
values
  (
    'airport-duplicate-flight',
    'airport-basic',
    'Duplicate departure flight number',
    'The departures board contains two different Wizz Air destinations using flight number W6 3711. The report must identify the duplicated flight identifier.',
    'Correct. Flight numbers should uniquely identify a scheduled flight on the board.'
  ),
  (
    'airport-cancelled-gate',
    'airport-basic',
    'Cancelled flight still has a gate',
    'The cancelled Bologna departure still displays gate A09. The report must identify the conflict between Cancelled status and an active gate assignment.',
    'Correct. A cancelled flight should not continue displaying an active boarding gate.'
  ),
  (
    'airport-landed-belt',
    'airport-basic',
    'Landed arrival has no baggage belt',
    'Flight RO 202 is marked Landed but displays no baggage belt. The report must identify the missing baggage collection information.',
    'Correct. A landed flight should provide passengers with a valid baggage belt.'
  ),
  (
    'airport-belt-announcement',
    'airport-basic',
    'Out-of-service belt is assigned to a flight',
    'The announcement says Terminal 1 belt 02 is out of service, while arrival W6 3712 is assigned to Terminal 1 belt 02.',
    'Correct. The arrival assignment conflicts with the airport announcement.'
  ),
  (
    'airport-invalid-hours',
    'airport-basic',
    'Invalid restaurant schedule',
    'The AeroGourmet Restaurant schedule is 26:00 to 29:00, which contains impossible clock times.',
    'Correct. The displayed schedule uses invalid time values.'
  ),
  (
    'airport-city-search',
    'airport-basic',
    'City search does not work',
    'The search field advertises city search, but searching for a destination or origin city such as Munich returns no flights because only flight numbers and airlines are searched.',
    'Correct. The advertised city-search behavior is not implemented.'
  )
on conflict (id) do update
set
  title = excluded.title,
  evaluation_criteria = excluded.evaluation_criteria,
  feedback_correct = excluded.feedback_correct,
  is_active = true;

notify pgrst, 'reload schema';
