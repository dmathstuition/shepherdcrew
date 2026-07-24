-- Registrations captured by the "Join a program" form (/api/join).
--
-- Row Level Security is enabled with NO policies, so the anon/public key can
-- neither read nor write this table. Inserts happen only through the API route
-- using the service-role key, which bypasses RLS. This keeps members' contact
-- details private while still allowing the server to store them.

create table if not exists public.registrations (
  id           uuid primary key default gen_random_uuid(),
  full_name    text        not null,
  phone        text        not null,
  email        text        not null,
  program      text        not null,
  ip           text,
  submitted_at timestamptz not null default now()
);

create index if not exists registrations_submitted_at_idx
  on public.registrations (submitted_at desc);

create index if not exists registrations_program_idx
  on public.registrations (program);

alter table public.registrations enable row level security;

-- Intentionally no policies: only the service role (server) may access rows.
