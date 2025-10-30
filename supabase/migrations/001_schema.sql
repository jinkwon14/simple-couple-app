-- Enable required extensions
create extension if not exists "pgcrypto";

create table public.profiles (
  user_id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  tz text not null default 'Asia/Seoul',
  push_token text,
  created_at timestamptz not null default now()
);

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.couple_members (
  couple_id uuid references public.couples on delete cascade,
  user_id uuid references public.profiles(user_id) on delete cascade,
  role text not null default 'member',
  primary key (couple_id, user_id)
);

create table public.questions (
  id bigserial primary key,
  text text not null,
  category text not null check (category in ('playful','values','memories','goals')),
  weight int not null default 1,
  active boolean not null default true
);

create table public.daily_questions (
  id bigserial primary key,
  couple_id uuid references public.couples on delete cascade,
  question_id bigint references public.questions on delete restrict,
  assigned_for_date date not null,
  assigned_at timestamptz not null default now(),
  unique (couple_id, assigned_for_date)
);

create table public.answers (
  id bigserial primary key,
  daily_question_id bigint references public.daily_questions on delete cascade,
  user_id uuid references public.profiles(user_id) on delete cascade,
  answer_text text not null,
  mood text check (mood in ('happy','calm','tired','stressed','excited')),
  created_at timestamptz not null default now(),
  unique (daily_question_id, user_id)
);

create table public.whiteboards (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references public.couples on delete cascade,
  opened_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table public.strokes (
  id bigserial primary key,
  whiteboard_id uuid references public.whiteboards on delete cascade,
  user_id uuid references public.profiles(user_id) on delete cascade,
  tool text not null check (tool in ('pen','eraser')),
  color text not null,
  width real not null check (width between 1 and 30),
  path jsonb not null,
  created_at timestamptz not null default now()
);

create table public.whiteboard_archive (
  id bigserial primary key,
  couple_id uuid references public.couples on delete cascade,
  opened_at timestamptz not null,
  closed_at timestamptz not null,
  image_url text not null
);

create type plant_stage as enum ('seed','sprout','mature');
create table public.garden_plots (
  id bigserial primary key,
  couple_id uuid references public.couples on delete cascade,
  plot_index smallint not null,
  seed_type text,
  planted_at timestamptz,
  watered_at timestamptz,
  stage plant_stage,
  unique (couple_id, plot_index)
);

create table public.pet_species (
  id smallserial primary key,
  name text not null,
  rarity text not null check (rarity in ('common','rare','ultra')),
  base_growth_rate int not null default 1
);

create type pet_stage as enum ('egg','baby','teen','adult');
create table public.pet_instances (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references public.couples on delete cascade,
  species_id smallint references public.pet_species on delete restrict,
  nickname text,
  stage pet_stage not null default 'egg',
  hunger int not null default 70,
  energy int not null default 70,
  happiness int not null default 70,
  last_interaction_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.eggs (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references public.couples on delete cascade,
  species_hint smallint references public.pet_species,
  rarity text not null default 'common',
  discovered_at timestamptz not null default now(),
  hatch_progress int not null default 0
);

create table public.inventory_items (
  id bigserial primary key,
  couple_id uuid references public.couples on delete cascade,
  kind text not null,
  qty int not null default 0,
  unique (couple_id, kind)
);

create type mission_status as enum ('active','completed','claimed');
create table public.missions (
  id smallserial primary key,
  code text unique not null,
  period text not null check (period in ('daily','weekly','monthly')),
  objective jsonb not null
);

create table public.couple_missions (
  id bigserial primary key,
  couple_id uuid references public.couples on delete cascade,
  mission_id smallint references public.missions on delete restrict,
  window_start timestamptz not null,
  window_end timestamptz not null,
  progress jsonb not null default '{}'::jsonb,
  status mission_status not null default 'active'
);

create table public.events_log (
  id bigserial primary key,
  couple_id uuid references public.couples on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
