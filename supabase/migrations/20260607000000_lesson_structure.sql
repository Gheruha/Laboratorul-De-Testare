-- Groups lessons into sidebar folders and prepares the schema for future quizzes.

create table if not exists public.lesson_modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  icon text not null default 'folder',
  order_index integer not null check (order_index > 0),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists lesson_modules_set_updated_at on public.lesson_modules;
create trigger lesson_modules_set_updated_at
before update on public.lesson_modules
for each row
execute function public.set_updated_at();

insert into public.lesson_modules (slug, title, description, order_index)
values (
  'manual-testing',
  'Manual Testing',
  'Core manual software testing lessons.',
  1
)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index;

alter table public.lessons
add column if not exists module_id uuid references public.lesson_modules(id);

update public.lessons
set module_id = (
  select id
  from public.lesson_modules
  where slug = 'manual-testing'
)
where module_id is null;

alter table public.lessons
alter column module_id set not null;

create unique index if not exists lessons_module_language_order_idx
  on public.lessons (module_id, language, order_index);

alter table public.lessons
drop constraint if exists lessons_content_has_blocks;

alter table public.lessons
add constraint lessons_content_has_blocks
check (
  jsonb_typeof(content) = 'object'
  and content ? 'blocks'
  and jsonb_typeof(content -> 'blocks') = 'array'
);

-- Lessons are readable without authentication. Writes remain restricted.
alter table public.lesson_modules enable row level security;
alter table public.lessons enable row level security;

drop policy if exists "Published modules are public" on public.lesson_modules;
create policy "Published modules are public"
on public.lesson_modules for select
using (is_published = true);

drop policy if exists "Published lessons are public" on public.lessons;
create policy "Published lessons are public"
on public.lessons for select
using (is_published = true);

-- Quiz definitions can be populated when the quiz feature is implemented.
create table if not exists public.quizzes (
  id text primary key,
  title text not null,
  passing_score integer not null default 70 check (passing_score between 0 and 100),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists quizzes_set_updated_at on public.quizzes;
create trigger quizzes_set_updated_at
before update on public.quizzes
for each row
execute function public.set_updated_at();

insert into public.quizzes (id, title)
select quiz_id, title || ' Quiz'
from public.lessons
where quiz_id is not null
on conflict (id) do nothing;

alter table public.lessons
drop constraint if exists lessons_quiz_id_fkey;

alter table public.lessons
add constraint lessons_quiz_id_fkey
foreign key (quiz_id) references public.quizzes(id);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id text not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  explanation text,
  selection_mode text not null default 'single'
    check (selection_mode in ('single', 'multiple')),
  order_index integer not null check (order_index > 0),
  created_at timestamptz not null default now(),
  unique (quiz_id, order_index)
);

create table if not exists public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  label text not null,
  is_correct boolean not null default false,
  order_index integer not null check (order_index > 0),
  unique (question_id, order_index)
);

notify pgrst, 'reload schema';
