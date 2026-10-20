-- MAPA AI initial schema.
-- Auth users live in auth.users (managed by Supabase Auth); app data references them.
-- Every table has Row Level Security so users can only touch their own rows.

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user, created automatically on sign-up.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Trips: saved AI itineraries.
-- ---------------------------------------------------------------------------
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  origin_airport text not null,
  destination_country text not null,
  selected_cities text[] not null default '{}',
  travel_month smallint not null check (travel_month between 1 and 12),
  duration smallint not null check (duration between 1 and 30),
  currency text not null,
  budget integer not null check (budget > 0),
  preferences text[] not null default '{}',
  status text not null default 'upcoming' check (status in ('upcoming', 'completed', 'cancelled')),
  budget_itinerary jsonb,
  experience_itinerary jsonb,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trips_user_id_created_at_idx on public.trips (user_id, created_at desc);

alter table public.trips enable row level security;

create policy "Users can view their own trips"
  on public.trips for select using (auth.uid() = user_id);
create policy "Users can create their own trips"
  on public.trips for insert with check (auth.uid() = user_id);
create policy "Users can update their own trips"
  on public.trips for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own trips"
  on public.trips for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Package requests: "Travel Package Quote" form submissions.
-- ---------------------------------------------------------------------------
create table public.package_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  contact_method text not null,
  destination text not null,
  travel_dates text,
  adults smallint not null default 1,
  children smallint not null default 0,
  budget_range text not null,
  interests text[] not null default '{}',
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.package_requests enable row level security;

create policy "Users can view their own package requests"
  on public.package_requests for select using (auth.uid() = user_id);
create policy "Users can create their own package requests"
  on public.package_requests for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Keep updated_at current.
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trips_set_updated_at before update on public.trips
  for each row execute function public.set_updated_at();
