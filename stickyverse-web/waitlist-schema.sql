-- Create waitlist table
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table public.waitlist enable row level security;

-- Create policy to allow anyone to insert their email to the waitlist
create policy "Allow anonymous inserts" on public.waitlist
  for insert with check (true);

-- Create policy to allow reading the waitlist (required for our simple admin page)
create policy "Allow reading waitlist" on public.waitlist
  for select using (true);
