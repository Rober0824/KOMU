-- Esquema inicial de "Comunidad" para Supabase (Postgres + RLS).
-- Ejecutar completo en el SQL Editor de un proyecto Supabase nuevo.
-- Diseñado para encajar 1:1 con los tipos de src/lib/mockData.ts y src/lib/match.ts,
-- de modo que el paso siguiente (tarea "Conectar la app a Supabase") sea sustituir
-- los arrays mock por consultas a estas tablas sin cambiar la lógica de matching.

create extension if not exists "pgcrypto";

-- ---------- Comunidades ----------
create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,          -- 'olivos', 'empresademo', ...
  name text not null,
  type text not null,                 -- 'Urbanización' | 'Empresa' | 'Municipio' | 'Colegio'
  icon text not null default '🏘️'
);

-- ---------- Perfiles (1:1 con auth.users) ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_color text not null default '#1F5C4A',
  rating numeric(3,2) not null default 5.0,
  trips_count int not null default 0,
  verified boolean not null default false,
  bio text,
  community_id uuid references communities(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- Trayectos publicados (como conductor) ----------
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references profiles(id) on delete cascade,
  community_id uuid not null references communities(id),
  origin_lat double precision not null,
  origin_lng double precision not null,
  origin_label text not null,
  dest_lat double precision not null,
  dest_lng double precision not null,
  dest_label text not null,
  depart_time time not null,
  days text[] not null default array['L','M','X','J','V'],
  seats int not null default 1,
  seats_left int not null default 1,
  recurring boolean not null default true,
  cost_share boolean not null default false,
  status text not null default 'active' check (status in ('active','paused','cancelled')),
  created_at timestamptz not null default now()
);

-- ---------- Búsquedas activas (como pasajero) — opcional, útil para notificar al conductor ----------
create table if not exists searches (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid not null references profiles(id) on delete cascade,
  community_id uuid not null references communities(id),
  origin_lat double precision not null,
  origin_lng double precision not null,
  origin_label text not null,
  dest_lat double precision not null,
  dest_lng double precision not null,
  dest_label text not null,
  wanted_time time not null,
  days text[] not null default array['L','M','X','J','V'],
  flex_min int not null default 30,
  created_at timestamptz not null default now()
);

-- ---------- Coincidencias (una vez que alguien decide "Hablar" o el sistema la sugiere) ----------
create table if not exists match_interactions (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  passenger_id uuid not null references profiles(id) on delete cascade,
  score int not null,
  detour_minutes int not null default 0,
  status text not null default 'new' check (status in ('new','accepted','ignored')),
  created_at timestamptz not null default now(),
  unique (trip_id, passenger_id)
);

-- ---------- Mensajes de chat, ligados a una coincidencia ----------
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references match_interactions(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

-- ================= ROW LEVEL SECURITY =================
alter table communities enable row level security;
alter table profiles enable row level security;
alter table trips enable row level security;
alter table searches enable row level security;
alter table match_interactions enable row level security;
alter table chat_messages enable row level security;

-- Comunidades: lectura pública (son solo el catálogo para elegir al hacer onboarding)
create policy "communities_select_all" on communities for select using (true);

-- Perfiles: cualquiera autenticado puede ver perfiles de su misma comunidad; solo el propio usuario edita el suyo
create policy "profiles_select_same_community" on profiles for select
  using (community_id = (select community_id from profiles where id = auth.uid()));
create policy "profiles_insert_own" on profiles for insert
  with check (id = auth.uid());
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());

-- Trayectos: visibles para cualquiera de la misma comunidad; solo el conductor los crea/edita
create policy "trips_select_same_community" on trips for select
  using (community_id = (select community_id from profiles where id = auth.uid()));
create policy "trips_insert_own" on trips for insert
  with check (driver_id = auth.uid());
create policy "trips_update_own" on trips for update
  using (driver_id = auth.uid());
create policy "trips_delete_own" on trips for delete
  using (driver_id = auth.uid());

-- Búsquedas: mismas reglas que trayectos, pero con passenger_id
create policy "searches_select_same_community" on searches for select
  using (community_id = (select community_id from profiles where id = auth.uid()));
create policy "searches_insert_own" on searches for insert
  with check (passenger_id = auth.uid());
create policy "searches_delete_own" on searches for delete
  using (passenger_id = auth.uid());

-- Coincidencias: visibles solo para el conductor del trayecto o el pasajero implicado
create policy "matches_select_participant" on match_interactions for select
  using (
    passenger_id = auth.uid()
    or trip_id in (select id from trips where driver_id = auth.uid())
  );
create policy "matches_insert_passenger" on match_interactions for insert
  with check (passenger_id = auth.uid());
create policy "matches_update_participant" on match_interactions for update
  using (
    passenger_id = auth.uid()
    or trip_id in (select id from trips where driver_id = auth.uid())
  );

-- Chat: visible y escribible solo por los dos participantes de la coincidencia
create policy "chat_select_participant" on chat_messages for select
  using (
    match_id in (
      select id from match_interactions
      where passenger_id = auth.uid()
         or trip_id in (select id from trips where driver_id = auth.uid())
    )
  );
create policy "chat_insert_participant" on chat_messages for insert
  with check (
    sender_id = auth.uid()
    and match_id in (
      select id from match_interactions
      where passenger_id = auth.uid()
         or trip_id in (select id from trips where driver_id = auth.uid())
    )
  );

-- ================= DATOS DE EJEMPLO (catálogo de comunidades) =================
insert into communities (slug, name, type, icon) values
  ('olivos', 'Residencial Los Olivos', 'Urbanización', '🏘️'),
  ('empresademo', 'Empresa Demo', 'Empresa', '🏢'),
  ('villanueva', 'Villanueva del Río', 'Municipio', '🏡'),
  ('sanjose', 'Colegio San José', 'Colegio', '🏫')
on conflict (slug) do nothing;
