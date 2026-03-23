-- Tables Bureau App

create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  nom text not null unique,
  pin text not null,
  couleur text not null
);

create table if not exists reservations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  date date not null,
  heure_debut integer not null,
  heure_fin integer not null,
  occupant text not null references users(nom),
  motif text not null
);

create table if not exists depenses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  date date not null,
  description text not null,
  categorie text not null,
  paye_par text not null references users(nom),
  montant numeric(10,2) not null
);

-- Seed users
insert into users (nom, pin, couleur) values
  ('Simon', '1234', '#3B82F6'),
  ('Franck', '1234', '#10B981'),
  ('Flo', '1234', '#F59E0B')
on conflict (nom) do nothing;

create table if not exists todos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  texte text not null,
  cree_par text not null references users(nom),
  fait boolean default false,
  fait_par text references users(nom),
  fait_le timestamptz,
  priorite text default 'normale' check (priorite in ('haute', 'normale', 'basse'))
);

-- RLS policies (permissive for anon key)
alter table users enable row level security;
alter table reservations enable row level security;
alter table depenses enable row level security;
alter table todos enable row level security;

create policy "Public read users" on users for select using (true);
create policy "Public read reservations" on reservations for select using (true);
create policy "Public insert reservations" on reservations for insert with check (true);
create policy "Public delete reservations" on reservations for delete using (true);
create policy "Public read depenses" on depenses for select using (true);
create policy "Public insert depenses" on depenses for insert with check (true);
create policy "Public update depenses" on depenses for update using (true) with check (true);
create policy "Public delete depenses" on depenses for delete using (true);
create policy "Public read todos" on todos for select using (true);
create policy "Public insert todos" on todos for insert with check (true);
create policy "Public update todos" on todos for update using (true) with check (true);
create policy "Public delete todos" on todos for delete using (true);
