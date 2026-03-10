-- ============================================================
-- Story Canvas — Supabase Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 0. Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. TABLES
-- ============================================================

-- --- stories ---
create table if not exists stories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  logline text not null default '',
  premise text not null default '',
  inciting_incident text not null default '',
  genre text[] not null default '{}',
  framework text not null default '',
  theme_central text not null default '',
  theme_question text not null default '',
  theme_message text not null default '',
  theme_value text not null default '',
  theme_declaration text not null default '',
  parent_story_id uuid references stories(id) on delete set null,
  fork_point text,
  status text not null default 'active' check (status in ('active', 'archived', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --- story_acts ---
create table if not exists story_acts (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references stories(id) on delete cascade,
  framework text not null default '',
  act_index integer not null,
  act_name text not null default '',
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --- characters ---
create table if not exists characters (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references stories(id) on delete cascade,
  name text not null default '',
  role text not null default '',
  archetypes jsonb not null default '[]',
  desire text not null default '',
  need text not null default '',
  fear text not null default '',
  flaw text not null default '',
  save_the_cat text not null default '',
  arc text not null default '',
  backstory text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --- character_relations ---
create table if not exists character_relations (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references stories(id) on delete cascade,
  character_a_id uuid not null references characters(id) on delete cascade,
  character_b_id uuid not null references characters(id) on delete cascade,
  label text not null default '',
  nature text not null default 'positive' check (nature in ('positive', 'negative', 'ambiguous')),
  temporal_changes jsonb not null default '[]',
  notes text not null default ''
);

-- --- subplots ---
create table if not exists subplots (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references stories(id) on delete cascade,
  name text not null default '',
  type text not null default 'custom' check (type in ('romance', 'friendship', 'political', 'investigation', 'secondary_arc', 'custom')),
  characters text[] not null default '{}',
  theme_connection text not null default '',
  arc_start text not null default '',
  arc_development text not null default '',
  arc_resolution text not null default '',
  notes text not null default ''
);

-- --- scenes ---
create table if not exists scenes (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references stories(id) on delete cascade,
  title text not null default '',
  act_index integer,
  subplot_id uuid references subplots(id) on delete set null,
  characters text[] not null default '{}',
  value_at_stake text not null default '',
  charge_start text not null default '+' check (charge_start in ('+', '-')),
  charge_end text not null default '-' check (charge_end in ('+', '-')),
  conflict text not null default '',
  change text not null default '',
  gap_expected text not null default '',
  gap_actual text not null default '',
  weight text not null default 'medium' check (weight in ('light', 'medium', 'heavy')),
  position_x real not null default 0,
  position_y real not null default 0,
  sort_order integer not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- --- scene_connections ---
create table if not exists scene_connections (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references stories(id) on delete cascade,
  scene_from_id uuid not null references scenes(id) on delete cascade,
  scene_to_id uuid not null references scenes(id) on delete cascade,
  label text not null default ''
);

-- --- promises (narrative promises / setup-payoff) ---
create table if not exists promises (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references stories(id) on delete cascade,
  name text not null default '',
  type text not null default 'other' check (type in ('object', 'information', 'relation', 'skill', 'prophecy', 'other')),
  setup_scene_id uuid references scenes(id) on delete set null,
  payoff_scene_id uuid references scenes(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'resolved', 'abandoned')),
  notes text not null default ''
);

-- --- information_reveals ---
create table if not exists information_reveals (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references stories(id) on delete cascade,
  description text not null default '',
  scenes_known_by jsonb not null default '[]',
  reader_reveal_scene_id uuid references scenes(id) on delete set null,
  dramatic_irony boolean not null default false,
  notes text not null default ''
);

-- --- world_notes ---
create table if not exists world_notes (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references stories(id) on delete cascade,
  category text not null default '',
  title text not null default '',
  content text not null default '',
  linked_characters text[] not null default '{}',
  linked_scenes text[] not null default '{}',
  linked_promises text[] not null default '{}'
);

-- --- board_notes ---
create table if not exists board_notes (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references stories(id) on delete cascade,
  content text not null default '',
  position_x real not null default 0,
  position_y real not null default 0,
  color text not null default '#fbbf24'
);

-- --- character_arc_points ---
create table if not exists character_arc_points (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references stories(id) on delete cascade,
  character_id uuid not null references characters(id) on delete cascade,
  scene_id uuid not null references scenes(id) on delete cascade,
  level real not null default 0 check (level >= -1 and level <= 1),
  notes text not null default ''
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

create index if not exists idx_stories_user_id on stories(user_id);
create index if not exists idx_stories_status on stories(status);
create index if not exists idx_story_acts_story_id on story_acts(story_id);
create index if not exists idx_characters_story_id on characters(story_id);
create index if not exists idx_character_relations_story_id on character_relations(story_id);
create index if not exists idx_scenes_story_id on scenes(story_id);
create index if not exists idx_scenes_sort_order on scenes(story_id, sort_order);
create index if not exists idx_scene_connections_story_id on scene_connections(story_id);
create index if not exists idx_subplots_story_id on subplots(story_id);
create index if not exists idx_promises_story_id on promises(story_id);
create index if not exists idx_information_reveals_story_id on information_reveals(story_id);
create index if not exists idx_world_notes_story_id on world_notes(story_id);
create index if not exists idx_board_notes_story_id on board_notes(story_id);
create index if not exists idx_character_arc_points_story_id on character_arc_points(story_id);
create index if not exists idx_character_arc_points_character_id on character_arc_points(character_id);

-- ============================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Helper: get the user_id for a story (used by child tables)
create or replace function get_story_owner(p_story_id uuid)
returns uuid as $$
  select user_id from stories where id = p_story_id;
$$ language sql security definer stable;

-- --- stories ---
alter table stories enable row level security;

create policy "Users can view own stories"
  on stories for select
  using (auth.uid() = user_id);

create policy "Users can insert own stories"
  on stories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own stories"
  on stories for update
  using (auth.uid() = user_id);

create policy "Users can delete own stories"
  on stories for delete
  using (auth.uid() = user_id);

-- Macro for child tables: policy that checks story ownership
-- We repeat for each table since Postgres doesn't support policy templates

-- --- story_acts ---
alter table story_acts enable row level security;

create policy "story_acts_select" on story_acts for select
  using (get_story_owner(story_id) = auth.uid());
create policy "story_acts_insert" on story_acts for insert
  with check (get_story_owner(story_id) = auth.uid());
create policy "story_acts_update" on story_acts for update
  using (get_story_owner(story_id) = auth.uid());
create policy "story_acts_delete" on story_acts for delete
  using (get_story_owner(story_id) = auth.uid());

-- --- characters ---
alter table characters enable row level security;

create policy "characters_select" on characters for select
  using (get_story_owner(story_id) = auth.uid());
create policy "characters_insert" on characters for insert
  with check (get_story_owner(story_id) = auth.uid());
create policy "characters_update" on characters for update
  using (get_story_owner(story_id) = auth.uid());
create policy "characters_delete" on characters for delete
  using (get_story_owner(story_id) = auth.uid());

-- --- character_relations ---
alter table character_relations enable row level security;

create policy "character_relations_select" on character_relations for select
  using (get_story_owner(story_id) = auth.uid());
create policy "character_relations_insert" on character_relations for insert
  with check (get_story_owner(story_id) = auth.uid());
create policy "character_relations_update" on character_relations for update
  using (get_story_owner(story_id) = auth.uid());
create policy "character_relations_delete" on character_relations for delete
  using (get_story_owner(story_id) = auth.uid());

-- --- subplots ---
alter table subplots enable row level security;

create policy "subplots_select" on subplots for select
  using (get_story_owner(story_id) = auth.uid());
create policy "subplots_insert" on subplots for insert
  with check (get_story_owner(story_id) = auth.uid());
create policy "subplots_update" on subplots for update
  using (get_story_owner(story_id) = auth.uid());
create policy "subplots_delete" on subplots for delete
  using (get_story_owner(story_id) = auth.uid());

-- --- scenes ---
alter table scenes enable row level security;

create policy "scenes_select" on scenes for select
  using (get_story_owner(story_id) = auth.uid());
create policy "scenes_insert" on scenes for insert
  with check (get_story_owner(story_id) = auth.uid());
create policy "scenes_update" on scenes for update
  using (get_story_owner(story_id) = auth.uid());
create policy "scenes_delete" on scenes for delete
  using (get_story_owner(story_id) = auth.uid());

-- --- scene_connections ---
alter table scene_connections enable row level security;

create policy "scene_connections_select" on scene_connections for select
  using (get_story_owner(story_id) = auth.uid());
create policy "scene_connections_insert" on scene_connections for insert
  with check (get_story_owner(story_id) = auth.uid());
create policy "scene_connections_update" on scene_connections for update
  using (get_story_owner(story_id) = auth.uid());
create policy "scene_connections_delete" on scene_connections for delete
  using (get_story_owner(story_id) = auth.uid());

-- --- promises ---
alter table promises enable row level security;

create policy "promises_select" on promises for select
  using (get_story_owner(story_id) = auth.uid());
create policy "promises_insert" on promises for insert
  with check (get_story_owner(story_id) = auth.uid());
create policy "promises_update" on promises for update
  using (get_story_owner(story_id) = auth.uid());
create policy "promises_delete" on promises for delete
  using (get_story_owner(story_id) = auth.uid());

-- --- information_reveals ---
alter table information_reveals enable row level security;

create policy "information_reveals_select" on information_reveals for select
  using (get_story_owner(story_id) = auth.uid());
create policy "information_reveals_insert" on information_reveals for insert
  with check (get_story_owner(story_id) = auth.uid());
create policy "information_reveals_update" on information_reveals for update
  using (get_story_owner(story_id) = auth.uid());
create policy "information_reveals_delete" on information_reveals for delete
  using (get_story_owner(story_id) = auth.uid());

-- --- world_notes ---
alter table world_notes enable row level security;

create policy "world_notes_select" on world_notes for select
  using (get_story_owner(story_id) = auth.uid());
create policy "world_notes_insert" on world_notes for insert
  with check (get_story_owner(story_id) = auth.uid());
create policy "world_notes_update" on world_notes for update
  using (get_story_owner(story_id) = auth.uid());
create policy "world_notes_delete" on world_notes for delete
  using (get_story_owner(story_id) = auth.uid());

-- --- board_notes ---
alter table board_notes enable row level security;

create policy "board_notes_select" on board_notes for select
  using (get_story_owner(story_id) = auth.uid());
create policy "board_notes_insert" on board_notes for insert
  with check (get_story_owner(story_id) = auth.uid());
create policy "board_notes_update" on board_notes for update
  using (get_story_owner(story_id) = auth.uid());
create policy "board_notes_delete" on board_notes for delete
  using (get_story_owner(story_id) = auth.uid());

-- --- character_arc_points ---
alter table character_arc_points enable row level security;

create policy "character_arc_points_select" on character_arc_points for select
  using (get_story_owner(story_id) = auth.uid());
create policy "character_arc_points_insert" on character_arc_points for insert
  with check (get_story_owner(story_id) = auth.uid());
create policy "character_arc_points_update" on character_arc_points for update
  using (get_story_owner(story_id) = auth.uid());
create policy "character_arc_points_delete" on character_arc_points for delete
  using (get_story_owner(story_id) = auth.uid());

-- ============================================================
-- 4. AUTO-UPDATE updated_at TRIGGER
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger stories_updated_at
  before update on stories
  for each row execute function update_updated_at();

create trigger story_acts_updated_at
  before update on story_acts
  for each row execute function update_updated_at();

create trigger characters_updated_at
  before update on characters
  for each row execute function update_updated_at();

create trigger scenes_updated_at
  before update on scenes
  for each row execute function update_updated_at();

-- ============================================================
-- Done! All tables, indexes, RLS policies, and triggers created.
-- ============================================================
