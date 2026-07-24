-- CBT class portal schema.
--
-- Design goals (see docs/portal-architecture.md):
--   * Members authenticate with an admin-issued access code, not a password.
--   * Correct answers, timing, and scoring are decided server-side only.
--   * One attempt per member per assessment, enforced by a DB constraint.
--
-- Every table has Row Level Security enabled with NO policies, so the
-- anon/publishable key can neither read nor write. All access goes through the
-- Next.js server using the service-role key, which bypasses RLS. Correct
-- answers therefore never leave the server except on a submitted result page.

-- ---------------------------------------------------------------------------
-- Cohorts: one run of a class (e.g. "BFC Cohort 1.0").
-- ---------------------------------------------------------------------------
create table if not exists public.cohorts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  starts_on  date,
  ends_on    date,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Members: a person in a cohort. access_code_hash is HMAC-SHA256(secret, code)
-- computed by the app (lib/portal-auth.ts) — the raw code is never stored.
-- ---------------------------------------------------------------------------
create table if not exists public.members (
  id               uuid primary key default gen_random_uuid(),
  cohort_id        uuid not null references public.cohorts(id) on delete cascade,
  full_name        text not null,
  phone            text,
  access_code_hash text not null unique,
  revoked          boolean not null default false,
  joined_at        timestamptz not null default now()
);
create index if not exists members_cohort_idx on public.members(cohort_id);

-- ---------------------------------------------------------------------------
-- Admins: the few accounts that manage the portal. Password + (optional) TOTP.
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text not null,
  totp_secret   text,
  role          text not null default 'admin',
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Assessments: a timed test belonging to a cohort.
-- ---------------------------------------------------------------------------
create table if not exists public.assessments (
  id               uuid primary key default gen_random_uuid(),
  cohort_id        uuid not null references public.cohorts(id) on delete cascade,
  title            text not null,
  week_number      int,
  duration_minutes int  not null default 20 check (duration_minutes > 0),
  opens_at         timestamptz,
  closes_at        timestamptz,
  is_published     boolean not null default false,
  created_at       timestamptz not null default now()
);
create index if not exists assessments_cohort_idx on public.assessments(cohort_id);

-- ---------------------------------------------------------------------------
-- Questions. options is a JSON array of choice strings; correct_option is the
-- 0-based index into that array. correct_option and explanation are SENSITIVE
-- and must never be sent to the exam client.
-- ---------------------------------------------------------------------------
create table if not exists public.questions (
  id             uuid primary key default gen_random_uuid(),
  assessment_id  uuid not null references public.assessments(id) on delete cascade,
  stem           text not null,
  type           text not null default 'single' check (type in ('single')),
  options        jsonb not null,
  correct_option int  not null check (correct_option >= 0),
  explanation    text,
  topic          text,
  position       int  not null default 0,
  created_at     timestamptz not null default now(),
  constraint questions_options_is_array check (jsonb_typeof(options) = 'array')
);
create index if not exists questions_assessment_idx on public.questions(assessment_id, position);

-- ---------------------------------------------------------------------------
-- Attempts: one per (member, assessment). started_at is stamped server-side;
-- question_order fixes a per-attempt shuffle. The unique constraint is the real
-- guard against second attempts — never trust the UI for this.
-- ---------------------------------------------------------------------------
create table if not exists public.attempts (
  id             uuid primary key default gen_random_uuid(),
  member_id      uuid not null references public.members(id) on delete cascade,
  assessment_id  uuid not null references public.assessments(id) on delete cascade,
  started_at     timestamptz not null default now(),
  submitted_at   timestamptz,
  score          int,
  total          int,
  question_order uuid[] not null default '{}',
  unique (member_id, assessment_id)
);
create index if not exists attempts_member_idx on public.attempts(member_id);

-- ---------------------------------------------------------------------------
-- Answers: autosaved as the member chooses. is_correct is computed server-side
-- at save time and is never returned to the client before submission.
-- ---------------------------------------------------------------------------
create table if not exists public.answers (
  id            uuid primary key default gen_random_uuid(),
  attempt_id    uuid not null references public.attempts(id) on delete cascade,
  question_id   uuid not null references public.questions(id) on delete cascade,
  chosen_option int  not null,
  is_correct    boolean not null default false,
  answered_at   timestamptz not null default now(),
  unique (attempt_id, question_id)
);
create index if not exists answers_attempt_idx on public.answers(attempt_id);

-- ---------------------------------------------------------------------------
-- Lock everything down: RLS on, no policies. Service role only.
-- ---------------------------------------------------------------------------
alter table public.cohorts     enable row level security;
alter table public.members     enable row level security;
alter table public.admins      enable row level security;
alter table public.assessments enable row level security;
alter table public.questions   enable row level security;
alter table public.attempts    enable row level security;
alter table public.answers     enable row level security;
