-- Shareable trips, departure dates and email reminders.

alter table public.trips
  add column share_id text unique,
  add column start_date date,
  add column reminders_enabled boolean not null default true;

-- Share links are random, unguessable tokens (>= 16 chars).
alter table public.trips add constraint trips_share_id_length check (share_id is null or length(share_id) >= 16);

-- ---------------------------------------------------------------------------
-- Public read of ONE shared trip by its token. Returns only safe columns —
-- never notes, user id or dates — and cannot be used to list shared trips.
-- ---------------------------------------------------------------------------
create function public.get_shared_trip(p_share_id text)
returns table (
  name text,
  origin_airport text,
  destination_country text,
  selected_cities text[],
  travel_month smallint,
  duration smallint,
  currency text,
  budget integer,
  preferences text[],
  budget_itinerary jsonb,
  experience_itinerary jsonb,
  booking_suggestions jsonb,
  owner_first_name text
)
language sql
stable
security definer set search_path = ''
as $$
  select t.name, t.origin_airport, t.destination_country, t.selected_cities, t.travel_month, t.duration,
         t.currency, t.budget, t.preferences, t.budget_itinerary, t.experience_itinerary, t.booking_suggestions,
         split_part(coalesce(p.full_name, ''), ' ', 1)
    from public.trips t
    left join public.profiles p on p.id = t.user_id
   where p_share_id is not null and length(p_share_id) >= 16 and t.share_id = p_share_id;
$$;

revoke execute on function public.get_shared_trip(text) from public;
grant execute on function public.get_shared_trip(text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Reminder log: one row per (trip, kind) so each email is sent once.
-- Written only by the server (service role); users can see their own.
-- ---------------------------------------------------------------------------
create table public.trip_reminders (
  trip_id uuid not null references public.trips (id) on delete cascade,
  kind text not null check (kind in ('30d', '7d')),
  sent_at timestamptz not null default now(),
  primary key (trip_id, kind)
);

alter table public.trip_reminders enable row level security;
create policy "Users can view reminders for their trips"
  on public.trip_reminders for select
  using (exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()));

create index trips_start_date_idx on public.trips (start_date) where start_date is not null and reminders_enabled;
