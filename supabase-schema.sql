-- Supabase SQL schema for "Where To Watch World Cup"
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

-- Create venues table
create table if not exists public.venues (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  name text not null,
  category text not null,
  custom_category text,
  address text not null,
  city text not null,
  state text not null,
  lat double precision,
  lng double precision,
  website text,
  maps_link text,
  logo_url text,
  opening_times jsonb default '{}'::jsonb
);

-- Enable RLS
alter table public.venues enable row level security;

-- Allow anyone to read venues
create policy "Public read access" on public.venues
  for select using (true);

-- Allow anyone to insert (for the listing form)
create policy "Public insert access" on public.venues
  for insert with check (true);

-- Create storage bucket for logos (run in SQL editor)
insert into storage.buckets (id, name, public) values ('venue-logos', 'venue-logos', true)
  on conflict do nothing;

-- Allow public uploads to venue-logos bucket
create policy "Public upload logos" on storage.objects
  for insert with check (bucket_id = 'venue-logos');

create policy "Public read logos" on storage.objects
  for select using (bucket_id = 'venue-logos');


-- SEED DATA (optional, for testing)
insert into public.venues (name, category, address, city, state, lat, lng, website, maps_link, opening_times) values
  ('The Goal Line Sports Bar', 'Sports Bar', '245 W 28th St', 'New York', 'NY', 40.7468, -73.9935, 'https://example.com', 'https://maps.google.com/?q=245+W+28th+St+New+York', '{"monday":{"open":"11:00","close":"01:00"},"tuesday":{"open":"11:00","close":"01:00"},"wednesday":{"open":"11:00","close":"01:00"},"thursday":{"open":"11:00","close":"02:00"},"friday":{"open":"11:00","close":"02:00"},"saturday":{"open":"10:00","close":"02:00"},"sunday":{"open":"10:00","close":"00:00"}}'),
  ('Futbol Cantina', 'Mexican', '1820 N Milwaukee Ave', 'Chicago', 'IL', 41.9135, -87.6684, 'https://example.com', 'https://maps.google.com/?q=1820+N+Milwaukee+Ave+Chicago', '{"monday":{"open":"12:00","close":"23:00"},"tuesday":{"open":"12:00","close":"23:00"},"wednesday":{"open":"12:00","close":"23:00"},"thursday":{"open":"12:00","close":"00:00"},"friday":{"open":"12:00","close":"01:00"},"saturday":{"open":"11:00","close":"01:00"},"sunday":{"open":"11:00","close":"22:00"}}'),
  ('Pitch & Pint Brewery', 'Brewery', '520 Haight St', 'San Francisco', 'CA', 37.7719, -122.4312, 'https://example.com', 'https://maps.google.com/?q=520+Haight+St+San+Francisco', '{"monday":{"open":"14:00","close":"23:00"},"tuesday":{"open":"14:00","close":"23:00"},"wednesday":{"open":"14:00","close":"23:00"},"thursday":{"open":"14:00","close":"00:00"},"friday":{"open":"12:00","close":"01:00"},"saturday":{"open":"11:00","close":"01:00"},"sunday":{"open":"11:00","close":"22:00"}}'),
  ('The Rooftop at World Cup', 'Rooftop', '101 Ocean Dr', 'Miami', 'FL', 25.7785, -80.1300, 'https://example.com', 'https://maps.google.com/?q=101+Ocean+Dr+Miami', '{"monday":{"open":"16:00","close":"00:00"},"tuesday":{"open":"16:00","close":"00:00"},"wednesday":{"open":"16:00","close":"00:00"},"thursday":{"open":"16:00","close":"01:00"},"friday":{"open":"15:00","close":"02:00"},"saturday":{"open":"12:00","close":"02:00"},"sunday":{"open":"12:00","close":"23:00"}}'),
  ('Red Card Pub', 'Pub', '4521 Maple Ave', 'Dallas', 'TX', 32.8143, -96.7984, 'https://example.com', 'https://maps.google.com/?q=4521+Maple+Ave+Dallas', '{"monday":{"open":"11:00","close":"00:00"},"tuesday":{"open":"11:00","close":"00:00"},"wednesday":{"open":"11:00","close":"00:00"},"thursday":{"open":"11:00","close":"01:00"},"friday":{"open":"11:00","close":"02:00"},"saturday":{"open":"10:00","close":"02:00"},"sunday":{"open":"10:00","close":"23:00"}}');
