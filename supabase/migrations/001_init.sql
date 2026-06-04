create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_km text not null,
  cover_image_url text not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title_km text not null,
  thumbnail_url text not null,
  category_id uuid not null references categories(id) on delete cascade,
  meal_slot text not null default 'any' check (meal_slot in ('breakfast', 'lunch', 'dinner', 'any')),
  youtube_url text not null,
  youtube_video_id text,
  duration_minutes int,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audio_labels (
  key text primary key,
  audio_url text not null,
  updated_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  recipe_id uuid references recipes(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  device_type text,
  created_at timestamptz not null default now()
);

create index if not exists recipes_category_published_idx on recipes(category_id, is_published);
create index if not exists recipes_meal_slot_published_idx on recipes(meal_slot, is_published);
create index if not exists recipes_youtube_video_id_idx on recipes(youtube_video_id);

alter table categories enable row level security;
alter table recipes enable row level security;
alter table audio_labels enable row level security;
alter table analytics_events enable row level security;

drop policy if exists categories_public_read on categories;
create policy categories_public_read on categories
for select using (is_active = true);

drop policy if exists recipes_public_read on recipes;
create policy recipes_public_read on recipes
for select using (is_published = true);

drop policy if exists categories_admin_write on categories;
create policy categories_admin_write on categories
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists recipes_admin_write on recipes;
create policy recipes_admin_write on recipes
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists audio_labels_admin_write on audio_labels;
create policy audio_labels_admin_write on audio_labels
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists analytics_admin_read on analytics_events;
create policy analytics_admin_read on analytics_events
for select using (auth.role() = 'authenticated');
