create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create type public.user_role as enum ('ADMIN', 'RESPONSABLE', 'MEMBRE', 'VISITEUR');
create type public.member_status as enum ('membre', 'visiteur', 'nouveau_converti');
create type public.service_type as enum ('semaine', 'dimanche', 'ecole_du_dimanche');
create type public.asset_state as enum ('bon', 'panne', 'reparation');
create type public.notification_type as enum ('rappel_evenement', 'alerte_suivi', 'message_interne', 'nouvelle_predication');
create type public.notification_channel as enum ('realtime', 'email', 'sms');
create type public.attendance_source as enum ('culte', 'cellule', 'departement');
create type public.inventory_movement_type as enum ('entree', 'sortie', 'maintenance', 'transfert');
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;
create table public.members (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  prenom text not null,
  telephone text not null unique,
  email text unique,
  adresse text,
  date_naissance date,
  statut public.member_status not null default 'membre',
  quartier text,
  responsable_id uuid references public.members(id) on delete set null,
  notes text,
  joined_at date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  display_name text,
  phone_number text,
  role public.user_role not null default 'VISITEUR',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create table public.prayer_cells (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  localisation text not null,
  responsable_id uuid references public.members(id) on delete set null,
  jour text not null,
  heure time not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create table public.cell_meetings (
  id uuid primary key default gen_random_uuid(),
  cellule_id uuid not null references public.prayer_cells(id) on delete cascade,
  date date not null,
  theme text not null,
  nb_hommes integer not null default 0 check (nb_hommes >= 0),
  nb_femmes integer not null default 0 check (nb_femmes >= 0),
  nb_enfants integer not null default 0 check (nb_enfants >= 0),
  nb_visiteurs integer not null default 0 check (nb_visiteurs >= 0),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);
create table public.worship_services (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  type public.service_type not null,
  predicateur text not null,
  theme text not null,
  nb_hommes integer not null default 0 check (nb_hommes >= 0),
  nb_femmes integer not null default 0 check (nb_femmes >= 0),
  nb_enfants integer not null default 0 check (nb_enfants >= 0),
  nb_visiteurs integer not null default 0 check (nb_visiteurs >= 0),
  audio_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create table public.newcomer_followups (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  date_conversion date,
  bapteme boolean not null default false,
  cellule_id uuid references public.prayer_cells(id) on delete set null,
  responsable_id uuid references public.members(id) on delete set null,
  notes text,
  prochain_suivi timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (member_id)
);
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  nom text not null unique,
  responsable_id uuid references public.members(id) on delete set null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create table public.department_activities (
  id uuid primary key default gen_random_uuid(),
  departement_id uuid not null references public.departments(id) on delete cascade,
  description text not null,
  date date not null,
  objectifs text,
  resultats text,
  created_at timestamptz not null default timezone('utc', now())
);
create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  categorie text not null,
  etat public.asset_state not null default 'bon',
  localisation text not null,
  date_achat date,
  cout numeric(12, 2) check (cout is null or cout >= 0),
  quantite integer not null default 1 check (quantite > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  bien_id uuid not null references public.inventory_items(id) on delete cascade,
  mouvement_type public.inventory_movement_type not null,
  quantite integer not null check (quantite > 0),
  destination text,
  commentaire text,
  moved_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);
create table public.sermons (
  id uuid primary key default gen_random_uuid(),
  culte_id uuid references public.worship_services(id) on delete set null,
  titre text not null,
  predicateur text not null,
  date date not null,
  heure time,
  resume text,
  video_url text,
  thumbnail_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  message text not null,
  type public.notification_type not null,
  canal public.notification_channel not null default 'realtime',
  audience_role public.user_role,
  member_id uuid references public.members(id) on delete cascade,
  scheduled_for timestamptz,
  sent_at timestamptz,
  read_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint notification_target_check check (
    audience_role is not null
    or member_id is not null
    or audience_role is null
  )
);
create table public.member_participations (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  source_type public.attendance_source not null,
  culte_id uuid references public.worship_services(id) on delete cascade,
  cellule_reunion_id uuid references public.cell_meetings(id) on delete cascade,
  departement_activite_id uuid references public.department_activities(id) on delete cascade,
  attended_at timestamptz not null default timezone('utc', now()),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
create trigger set_members_updated_at
before update on public.members
for each row execute function public.set_updated_at();
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
create trigger set_prayer_cells_updated_at
before update on public.prayer_cells
for each row execute function public.set_updated_at();
create trigger set_worship_services_updated_at
before update on public.worship_services
for each row execute function public.set_updated_at();
create trigger set_newcomer_followups_updated_at
before update on public.newcomer_followups
for each row execute function public.set_updated_at();
create trigger set_departments_updated_at
before update on public.departments
for each row execute function public.set_updated_at();
create trigger set_inventory_items_updated_at
before update on public.inventory_items
for each row execute function public.set_updated_at();
create trigger set_sermons_updated_at
before update on public.sermons
for each row execute function public.set_updated_at();
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
as $$
  select coalesce(
    (select role from public.profiles where user_id = auth.uid()),
    'VISITEUR'::public.user_role
  );
$$;
create or replace function public.current_member_id()
returns uuid
language sql
stable
as $$
  select member_id from public.profiles where user_id = auth.uid();
$$;
create index idx_members_statut on public.members(statut);
create index idx_members_quartier on public.members(quartier);
create index idx_members_responsable on public.members(responsable_id);
create index idx_members_search on public.members using gin (
  to_tsvector('simple', coalesce(nom, '') || ' ' || coalesce(prenom, '') || ' ' || coalesce(email, '') || ' ' || coalesce(telephone, ''))
);
create index idx_profiles_role on public.profiles(role);
create index idx_prayer_cells_responsable on public.prayer_cells(responsable_id);
create index idx_prayer_cells_jour on public.prayer_cells(jour);
create index idx_cell_meetings_cell_date on public.cell_meetings(cellule_id, date desc);
create index idx_worship_services_date_type on public.worship_services(date desc, type);
create index idx_newcomer_followups_responsable on public.newcomer_followups(responsable_id);
create index idx_newcomer_followups_cellule on public.newcomer_followups(cellule_id);
create index idx_departments_responsable on public.departments(responsable_id);
create index idx_department_activities_department_date on public.department_activities(departement_id, date desc);
create index idx_inventory_items_categorie on public.inventory_items(categorie);
create index idx_inventory_items_etat on public.inventory_items(etat);
create index idx_inventory_movements_item_date on public.inventory_movements(bien_id, moved_at desc);
create index idx_sermons_date on public.sermons(date desc);
create index idx_sermons_predicateur on public.sermons(predicateur);
create index idx_sermons_search on public.sermons using gin (
  to_tsvector('simple', coalesce(titre, '') || ' ' || coalesce(predicateur, '') || ' ' || coalesce(resume, ''))
);
create index idx_notifications_member on public.notifications(member_id);
create index idx_notifications_audience on public.notifications(audience_role);
create index idx_notifications_scheduled on public.notifications(scheduled_for);
create index idx_participations_member_date on public.member_participations(member_id, attended_at desc);
create or replace view public.report_member_summary as
select
  statut,
  count(*) as total
from public.members
group by statut;
create or replace view public.report_service_summary as
select
  date,
  type,
  predicateur,
  theme,
  (nb_hommes + nb_femmes + nb_enfants + nb_visiteurs) as total_presence,
  nb_visiteurs
from public.worship_services;
create or replace view public.report_cell_activity as
select
  c.nom as cellule,
  m.date,
  m.theme,
  (m.nb_hommes + m.nb_femmes + m.nb_enfants + m.nb_visiteurs) as total_participants,
  m.nb_visiteurs
from public.cell_meetings m
join public.prayer_cells c on c.id = m.cellule_id;
create or replace view public.report_sermon_summary as
select
  s.date,
  s.titre,
  s.predicateur,
  s.video_url,
  case when s.video_url is not null then 1 else 0 end as published
from public.sermons s;
alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.prayer_cells enable row level security;
alter table public.cell_meetings enable row level security;
alter table public.worship_services enable row level security;
alter table public.newcomer_followups enable row level security;
alter table public.departments enable row level security;
alter table public.department_activities enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.sermons enable row level security;
alter table public.notifications enable row level security;
alter table public.member_participations enable row level security;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
using (auth.uid() is not null and (user_id = auth.uid() or public.current_user_role() = 'ADMIN'));
create policy "profiles_update_self_or_admin"
on public.profiles
for update
using (auth.uid() is not null and (user_id = auth.uid() or public.current_user_role() = 'ADMIN'))
with check (user_id = auth.uid() or public.current_user_role() = 'ADMIN');
create policy "members_select"
on public.members
for select
using (
  auth.uid() is not null
  and (
    public.current_user_role() in ('ADMIN', 'RESPONSABLE', 'MEMBRE')
    or id = public.current_member_id()
  )
);
create policy "members_insert"
on public.members
for insert
with check (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "members_update"
on public.members
for update
using (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'))
with check (public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "members_delete"
on public.members
for delete
using (auth.uid() is not null and public.current_user_role() = 'ADMIN');
create policy "prayer_cells_select"
on public.prayer_cells
for select
using (auth.uid() is not null);
create policy "prayer_cells_insert"
on public.prayer_cells
for insert
with check (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "prayer_cells_update"
on public.prayer_cells
for update
using (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'))
with check (public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "prayer_cells_delete"
on public.prayer_cells
for delete
using (auth.uid() is not null and public.current_user_role() = 'ADMIN');
create policy "cell_meetings_select"
on public.cell_meetings
for select
using (auth.uid() is not null);
create policy "cell_meetings_insert"
on public.cell_meetings
for insert
with check (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "cell_meetings_update"
on public.cell_meetings
for update
using (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'))
with check (public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "cell_meetings_delete"
on public.cell_meetings
for delete
using (auth.uid() is not null and public.current_user_role() = 'ADMIN');
create policy "services_select"
on public.worship_services
for select
using (auth.uid() is not null);
create policy "services_insert"
on public.worship_services
for insert
with check (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "services_update"
on public.worship_services
for update
using (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'))
with check (public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "services_delete"
on public.worship_services
for delete
using (auth.uid() is not null and public.current_user_role() = 'ADMIN');
create policy "followups_select"
on public.newcomer_followups
for select
using (
  auth.uid() is not null
  and (
    public.current_user_role() in ('ADMIN', 'RESPONSABLE')
    or member_id = public.current_member_id()
  )
);
create policy "followups_insert"
on public.newcomer_followups
for insert
with check (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "followups_update"
on public.newcomer_followups
for update
using (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'))
with check (public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "followups_delete"
on public.newcomer_followups
for delete
using (auth.uid() is not null and public.current_user_role() = 'ADMIN');
create policy "departments_select"
on public.departments
for select
using (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE', 'MEMBRE'));
create policy "departments_insert"
on public.departments
for insert
with check (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "departments_update"
on public.departments
for update
using (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'))
with check (public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "departments_delete"
on public.departments
for delete
using (auth.uid() is not null and public.current_user_role() = 'ADMIN');
create policy "department_activities_select"
on public.department_activities
for select
using (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE', 'MEMBRE'));
create policy "department_activities_insert"
on public.department_activities
for insert
with check (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "department_activities_update"
on public.department_activities
for update
using (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'))
with check (public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "department_activities_delete"
on public.department_activities
for delete
using (auth.uid() is not null and public.current_user_role() = 'ADMIN');
create policy "inventory_items_select"
on public.inventory_items
for select
using (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE', 'MEMBRE'));
create policy "inventory_items_insert"
on public.inventory_items
for insert
with check (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "inventory_items_update"
on public.inventory_items
for update
using (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'))
with check (public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "inventory_items_delete"
on public.inventory_items
for delete
using (auth.uid() is not null and public.current_user_role() = 'ADMIN');
create policy "inventory_movements_select"
on public.inventory_movements
for select
using (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE', 'MEMBRE'));
create policy "inventory_movements_insert"
on public.inventory_movements
for insert
with check (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "inventory_movements_update"
on public.inventory_movements
for update
using (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'))
with check (public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "inventory_movements_delete"
on public.inventory_movements
for delete
using (auth.uid() is not null and public.current_user_role() = 'ADMIN');
create policy "sermons_select"
on public.sermons
for select
using (auth.uid() is not null);
create policy "sermons_insert"
on public.sermons
for insert
with check (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "sermons_update"
on public.sermons
for update
using (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'))
with check (public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "sermons_delete"
on public.sermons
for delete
using (auth.uid() is not null and public.current_user_role() = 'ADMIN');
create policy "notifications_select"
on public.notifications
for select
using (
  auth.uid() is not null
  and (
    public.current_user_role() = 'ADMIN'
    or (member_id is not null and member_id = public.current_member_id())
    or (member_id is null and audience_role is null)
    or audience_role = public.current_user_role()
  )
);
create policy "notifications_insert"
on public.notifications
for insert
with check (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "notifications_update"
on public.notifications
for update
using (
  auth.uid() is not null
  and (
    public.current_user_role() in ('ADMIN', 'RESPONSABLE')
    or (member_id is not null and member_id = public.current_member_id())
    or audience_role = public.current_user_role()
  )
)
with check (
  public.current_user_role() in ('ADMIN', 'RESPONSABLE')
  or (member_id is not null and member_id = public.current_member_id())
  or audience_role = public.current_user_role()
);
create policy "notifications_delete"
on public.notifications
for delete
using (auth.uid() is not null and public.current_user_role() = 'ADMIN');
create policy "participations_select"
on public.member_participations
for select
using (
  auth.uid() is not null
  and (
    public.current_user_role() in ('ADMIN', 'RESPONSABLE', 'MEMBRE')
    or member_id = public.current_member_id()
  )
);
create policy "participations_insert"
on public.member_participations
for insert
with check (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "participations_update"
on public.member_participations
for update
using (auth.uid() is not null and public.current_user_role() in ('ADMIN', 'RESPONSABLE'))
with check (public.current_user_role() in ('ADMIN', 'RESPONSABLE'));
create policy "participations_delete"
on public.member_participations
for delete
using (auth.uid() is not null and public.current_user_role() = 'ADMIN');
