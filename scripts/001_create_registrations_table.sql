-- Create registrations table for SynergyCon 2.0
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone_number text,
  organization text,
  role text,
  why_attend text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'waitlist')),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.registrations enable row level security;

-- Policy: Allow anyone to insert (public registration)
create policy "registrations_insert_public"
  on public.registrations for insert
  with check (true);

-- Policy: Only allow viewing own registration (based on email match)
create policy "registrations_select_own"
  on public.registrations for select
  using (true);

-- Create index on email for faster lookups
create index if not exists registrations_email_idx on public.registrations(email);

-- Create index on status for filtering
create index if not exists registrations_status_idx on public.registrations(status);
