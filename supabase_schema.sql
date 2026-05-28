-- ============================================================
-- PrintFlow – Supabase Database Schema
-- Uitvoeren via: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Profiles (gekoppeld aan auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz default now()
);

-- Automatisch profiel aanmaken bij registratie
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Printers
create table if not exists printers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Voorbeelddata printers (pas aan naar jouw situatie)
insert into printers (name, description) values
  ('Printer 1 – Prusa XL',   'Multi-materiaal, groot formaat'),
  ('Printer 2 – Prusa MK4',  'Standaard FDM'),
  ('Printer 3 – Bambu X1C',  'Hoge snelheid'),
  ('Printer 4 – Resin',      'Hoge resolutie')
on conflict (name) do nothing;

-- 3. Article Library (artikelgeheugen)
create table if not exists article_library (
  id uuid primary key default gen_random_uuid(),
  article_number text not null unique,
  description text,
  material text,
  color text,
  default_print_hours int default 0,
  default_print_minutes int default 30,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Print Orders (hoofdtabel)
create table if not exists print_orders (
  id uuid primary key default gen_random_uuid(),
  order_name text not null,
  article_number text,
  quantity int not null default 1,
  material text not null default 'PLA',
  color text default 'Zwart',
  printer_id uuid references printers(id) on delete set null,
  deadline date,
  print_hours int not null default 0,
  print_minutes int not null default 30,
  notes text,
  status text not null default 'new'
    check (status in ('new', 'preparing', 'printing', 'done', 'failed', 'cancelled')),
  created_by uuid references profiles(id) on delete set null,
  started_by uuid references profiles(id) on delete set null,
  started_at timestamptz,
  end_time timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger: updated_at bijwerken
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger print_orders_updated_at
  before update on print_orders
  for each row execute procedure update_updated_at();

create trigger article_library_updated_at
  before update on article_library
  for each row execute procedure update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Alle ingelogde gebruikers kunnen alles lezen en schrijven
-- ============================================================

alter table profiles enable row level security;
alter table printers enable row level security;
alter table print_orders enable row level security;
alter table article_library enable row level security;

-- Profiles
create policy "Ingelogde gebruikers zien profielen"
  on profiles for select using (auth.role() = 'authenticated');

create policy "Eigen profiel aanpassen"
  on profiles for update using (auth.uid() = id);

-- Printers
create policy "Iedereen ziet printers"
  on printers for select using (auth.role() = 'authenticated');

-- Print Orders
create policy "Iedereen ziet orders"
  on print_orders for select using (auth.role() = 'authenticated');

create policy "Iedereen maakt orders"
  on print_orders for insert with check (auth.role() = 'authenticated');

create policy "Iedereen wijzigt orders"
  on print_orders for update using (auth.role() = 'authenticated');

-- Article Library
create policy "Iedereen ziet artikelen"
  on article_library for select using (auth.role() = 'authenticated');

create policy "Iedereen maakt/wijzigt artikelen"
  on article_library for insert with check (auth.role() = 'authenticated');

create policy "Iedereen updatet artikelen"
  on article_library for update using (auth.role() = 'authenticated');

-- ============================================================
-- REALTIME inschakelen
-- ============================================================
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table print_orders;
alter publication supabase_realtime add table printers;
