-- ============================================================
-- MIGRATION : passage en SaaS multi-tenant
-- Chaque "église" est un tenant isolé identifié par church_id
-- ============================================================

-- -------------------------------------------------------
-- 1. TABLE churches (ancre tenant)
-- -------------------------------------------------------
create table public.churches (
  id         uuid primary key default gen_random_uuid(),
  nom        text not null,
  slug       text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_churches_updated_at
before update on public.churches
for each row execute function public.set_updated_at();

alter table public.churches enable row level security;

-- -------------------------------------------------------
-- 2. Colonne church_id sur profiles (nullable — renseignée
--    lors de l'onboarding, pas par le trigger auth)
-- -------------------------------------------------------
alter table public.profiles
  add column church_id uuid references public.churches(id) on delete cascade;

create index idx_profiles_church on public.profiles(church_id);

-- -------------------------------------------------------
-- 3. Contraintes d'unicité globales à supprimer
--    (deviennent per-church)
-- -------------------------------------------------------
alter table public.members           drop constraint members_telephone_key;
alter table public.members           drop constraint members_email_key;
alter table public.departments       drop constraint departments_nom_key;
alter table public.newcomer_followups drop constraint newcomer_followups_member_id_key;

-- -------------------------------------------------------
-- 4. Colonne church_id NOT NULL sur les 12 tables métier
-- -------------------------------------------------------
alter table public.members
  add column church_id uuid not null references public.churches(id) on delete cascade;

alter table public.prayer_cells
  add column church_id uuid not null references public.churches(id) on delete cascade;

alter table public.cell_meetings
  add column church_id uuid not null references public.churches(id) on delete cascade;

alter table public.worship_services
  add column church_id uuid not null references public.churches(id) on delete cascade;

alter table public.newcomer_followups
  add column church_id uuid not null references public.churches(id) on delete cascade;

alter table public.departments
  add column church_id uuid not null references public.churches(id) on delete cascade;

alter table public.department_activities
  add column church_id uuid not null references public.churches(id) on delete cascade;

alter table public.inventory_items
  add column church_id uuid not null references public.churches(id) on delete cascade;

alter table public.inventory_movements
  add column church_id uuid not null references public.churches(id) on delete cascade;

alter table public.sermons
  add column church_id uuid not null references public.churches(id) on delete cascade;

alter table public.notifications
  add column church_id uuid not null references public.churches(id) on delete cascade;

alter table public.member_participations
  add column church_id uuid not null references public.churches(id) on delete cascade;

-- -------------------------------------------------------
-- 5. Nouvelles contraintes d'unicité per-church
-- -------------------------------------------------------
alter table public.members
  add constraint members_telephone_church_key unique (telephone, church_id);

alter table public.members
  add constraint members_email_church_key unique (email, church_id);

alter table public.departments
  add constraint departments_nom_church_key unique (nom, church_id);

alter table public.newcomer_followups
  add constraint newcomer_followups_member_church_key unique (member_id, church_id);

-- -------------------------------------------------------
-- 6. Fonction helper : current_church_id()
-- -------------------------------------------------------
create or replace function public.current_church_id()
returns uuid
language sql
stable
as $$
  select church_id from public.profiles where user_id = auth.uid();
$$;

-- -------------------------------------------------------
-- 7. Réécriture des index — préfixer church_id là où c'est utile
-- -------------------------------------------------------
drop index if exists public.idx_members_statut;
drop index if exists public.idx_members_quartier;
drop index if exists public.idx_cell_meetings_cell_date;
drop index if exists public.idx_worship_services_date_type;
drop index if exists public.idx_sermons_date;
drop index if exists public.idx_sermons_predicateur;
drop index if exists public.idx_notifications_member;
drop index if exists public.idx_notifications_audience;
drop index if exists public.idx_participations_member_date;
drop index if exists public.idx_inventory_movements_item_date;
drop index if exists public.idx_department_activities_department_date;

create index idx_members_statut                   on public.members(church_id, statut);
create index idx_members_quartier                 on public.members(church_id, quartier);
create index idx_cell_meetings_cell_date          on public.cell_meetings(church_id, cellule_id, date desc);
create index idx_worship_services_date_type       on public.worship_services(church_id, date desc, type);
create index idx_sermons_date                     on public.sermons(church_id, date desc);
create index idx_sermons_predicateur              on public.sermons(church_id, predicateur);
create index idx_notifications_member             on public.notifications(church_id, member_id);
create index idx_notifications_audience           on public.notifications(church_id, audience_role);
create index idx_participations_member_date       on public.member_participations(church_id, member_id, attended_at desc);
create index idx_inventory_movements_item_date    on public.inventory_movements(church_id, bien_id, moved_at desc);
create index idx_department_activities_dept_date  on public.department_activities(church_id, departement_id, date desc);

-- Index church_id simples sur les tables restantes
create index idx_prayer_cells_church              on public.prayer_cells(church_id);
create index idx_newcomer_followups_church        on public.newcomer_followups(church_id);
create index idx_departments_church               on public.departments(church_id);
create index idx_inventory_items_church           on public.inventory_items(church_id);

-- -------------------------------------------------------
-- 8. Vues rapports — filtrées par church_id du user courant
-- -------------------------------------------------------
create or replace view public.report_member_summary as
select
  statut,
  count(*) as total
from public.members
where church_id = public.current_church_id()
group by statut;

create or replace view public.report_service_summary as
select
  date,
  type,
  predicateur,
  theme,
  (nb_hommes + nb_femmes + nb_enfants + nb_visiteurs) as total_presence,
  nb_visiteurs
from public.worship_services
where church_id = public.current_church_id();

create or replace view public.report_cell_activity as
select
  c.nom as cellule,
  m.date,
  m.theme,
  (m.nb_hommes + m.nb_femmes + m.nb_enfants + m.nb_visiteurs) as total_participants,
  m.nb_visiteurs
from public.cell_meetings m
join public.prayer_cells c on c.id = m.cellule_id
where m.church_id = public.current_church_id();

create or replace view public.report_sermon_summary as
select
  s.date,
  s.titre,
  s.predicateur,
  s.video_url,
  case when s.video_url is not null then 1 else 0 end as published
from public.sermons s
where s.church_id = public.current_church_id();

-- -------------------------------------------------------
-- 9. Suppression des anciennes policies RLS
-- -------------------------------------------------------
drop policy if exists "profiles_select_self_or_admin"          on public.profiles;
drop policy if exists "profiles_update_self_or_admin"          on public.profiles;

drop policy if exists "members_select"                         on public.members;
drop policy if exists "members_insert"                         on public.members;
drop policy if exists "members_update"                         on public.members;
drop policy if exists "members_delete"                         on public.members;

drop policy if exists "prayer_cells_select"                    on public.prayer_cells;
drop policy if exists "prayer_cells_insert"                    on public.prayer_cells;
drop policy if exists "prayer_cells_update"                    on public.prayer_cells;
drop policy if exists "prayer_cells_delete"                    on public.prayer_cells;

drop policy if exists "cell_meetings_select"                   on public.cell_meetings;
drop policy if exists "cell_meetings_insert"                   on public.cell_meetings;
drop policy if exists "cell_meetings_update"                   on public.cell_meetings;
drop policy if exists "cell_meetings_delete"                   on public.cell_meetings;

drop policy if exists "services_select"                        on public.worship_services;
drop policy if exists "services_insert"                        on public.worship_services;
drop policy if exists "services_update"                        on public.worship_services;
drop policy if exists "services_delete"                        on public.worship_services;

drop policy if exists "followups_select"                       on public.newcomer_followups;
drop policy if exists "followups_insert"                       on public.newcomer_followups;
drop policy if exists "followups_update"                       on public.newcomer_followups;
drop policy if exists "followups_delete"                       on public.newcomer_followups;

drop policy if exists "departments_select"                     on public.departments;
drop policy if exists "departments_insert"                     on public.departments;
drop policy if exists "departments_update"                     on public.departments;
drop policy if exists "departments_delete"                     on public.departments;

drop policy if exists "department_activities_select"           on public.department_activities;
drop policy if exists "department_activities_insert"           on public.department_activities;
drop policy if exists "department_activities_update"           on public.department_activities;
drop policy if exists "department_activities_delete"           on public.department_activities;

drop policy if exists "inventory_items_select"                 on public.inventory_items;
drop policy if exists "inventory_items_insert"                 on public.inventory_items;
drop policy if exists "inventory_items_update"                 on public.inventory_items;
drop policy if exists "inventory_items_delete"                 on public.inventory_items;

drop policy if exists "inventory_movements_select"             on public.inventory_movements;
drop policy if exists "inventory_movements_insert"             on public.inventory_movements;
drop policy if exists "inventory_movements_update"             on public.inventory_movements;
drop policy if exists "inventory_movements_delete"             on public.inventory_movements;

drop policy if exists "sermons_select"                         on public.sermons;
drop policy if exists "sermons_insert"                         on public.sermons;
drop policy if exists "sermons_update"                         on public.sermons;
drop policy if exists "sermons_delete"                        on public.sermons;

drop policy if exists "notifications_select"                   on public.notifications;
drop policy if exists "notifications_insert"                   on public.notifications;
drop policy if exists "notifications_update"                   on public.notifications;
drop policy if exists "notifications_delete"                   on public.notifications;

drop policy if exists "participations_select"                  on public.member_participations;
drop policy if exists "participations_insert"                  on public.member_participations;
drop policy if exists "participations_update"                  on public.member_participations;
drop policy if exists "participations_delete"                  on public.member_participations;

-- -------------------------------------------------------
-- 10. Nouvelles policies RLS — toutes scopées par church_id
-- -------------------------------------------------------

-- churches
create policy "churches_select"
on public.churches for select
using (id = public.current_church_id());

create policy "churches_update"
on public.churches for update
using (id = public.current_church_id() and public.current_user_role() = 'ADMIN')
with check (id = public.current_church_id() and public.current_user_role() = 'ADMIN');

-- profiles
create policy "profiles_select_self_or_admin"
on public.profiles for select
using (
  auth.uid() is not null
  and (
    user_id = auth.uid()
    or (public.current_user_role() = 'ADMIN' and church_id = public.current_church_id())
  )
);

create policy "profiles_update_self_or_admin"
on public.profiles for update
using (
  auth.uid() is not null
  and (
    user_id = auth.uid()
    or (public.current_user_role() = 'ADMIN' and church_id = public.current_church_id())
  )
)
with check (
  user_id = auth.uid()
  or (public.current_user_role() = 'ADMIN' and church_id = public.current_church_id())
);

-- members
create policy "members_select"
on public.members for select
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and (
    public.current_user_role() in ('ADMIN', 'RESPONSABLE', 'MEMBRE')
    or id = public.current_member_id()
  )
);

create policy "members_insert"
on public.members for insert
with check (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "members_update"
on public.members for update
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
)
with check (
  church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "members_delete"
on public.members for delete
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() = 'ADMIN'
);

-- prayer_cells
create policy "prayer_cells_select"
on public.prayer_cells for select
using (auth.uid() is not null and church_id = public.current_church_id());

create policy "prayer_cells_insert"
on public.prayer_cells for insert
with check (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "prayer_cells_update"
on public.prayer_cells for update
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
)
with check (
  church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "prayer_cells_delete"
on public.prayer_cells for delete
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() = 'ADMIN'
);

-- cell_meetings
create policy "cell_meetings_select"
on public.cell_meetings for select
using (auth.uid() is not null and church_id = public.current_church_id());

create policy "cell_meetings_insert"
on public.cell_meetings for insert
with check (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "cell_meetings_update"
on public.cell_meetings for update
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
)
with check (
  church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "cell_meetings_delete"
on public.cell_meetings for delete
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() = 'ADMIN'
);

-- worship_services
create policy "services_select"
on public.worship_services for select
using (auth.uid() is not null and church_id = public.current_church_id());

create policy "services_insert"
on public.worship_services for insert
with check (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "services_update"
on public.worship_services for update
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
)
with check (
  church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "services_delete"
on public.worship_services for delete
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() = 'ADMIN'
);

-- newcomer_followups
create policy "followups_select"
on public.newcomer_followups for select
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and (
    public.current_user_role() in ('ADMIN', 'RESPONSABLE')
    or member_id = public.current_member_id()
  )
);

create policy "followups_insert"
on public.newcomer_followups for insert
with check (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "followups_update"
on public.newcomer_followups for update
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
)
with check (
  church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "followups_delete"
on public.newcomer_followups for delete
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() = 'ADMIN'
);

-- departments
create policy "departments_select"
on public.departments for select
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE', 'MEMBRE')
);

create policy "departments_insert"
on public.departments for insert
with check (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "departments_update"
on public.departments for update
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
)
with check (
  church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "departments_delete"
on public.departments for delete
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() = 'ADMIN'
);

-- department_activities
create policy "department_activities_select"
on public.department_activities for select
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE', 'MEMBRE')
);

create policy "department_activities_insert"
on public.department_activities for insert
with check (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "department_activities_update"
on public.department_activities for update
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
)
with check (
  church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "department_activities_delete"
on public.department_activities for delete
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() = 'ADMIN'
);

-- inventory_items
create policy "inventory_items_select"
on public.inventory_items for select
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE', 'MEMBRE')
);

create policy "inventory_items_insert"
on public.inventory_items for insert
with check (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "inventory_items_update"
on public.inventory_items for update
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
)
with check (
  church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "inventory_items_delete"
on public.inventory_items for delete
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() = 'ADMIN'
);

-- inventory_movements
create policy "inventory_movements_select"
on public.inventory_movements for select
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE', 'MEMBRE')
);

create policy "inventory_movements_insert"
on public.inventory_movements for insert
with check (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "inventory_movements_update"
on public.inventory_movements for update
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
)
with check (
  church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "inventory_movements_delete"
on public.inventory_movements for delete
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() = 'ADMIN'
);

-- sermons
create policy "sermons_select"
on public.sermons for select
using (auth.uid() is not null and church_id = public.current_church_id());

create policy "sermons_insert"
on public.sermons for insert
with check (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "sermons_update"
on public.sermons for update
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
)
with check (
  church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "sermons_delete"
on public.sermons for delete
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() = 'ADMIN'
);

-- notifications
create policy "notifications_select"
on public.notifications for select
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and (
    public.current_user_role() = 'ADMIN'
    or (member_id is not null and member_id = public.current_member_id())
    or (member_id is null and audience_role is null)
    or audience_role = public.current_user_role()
  )
);

create policy "notifications_insert"
on public.notifications for insert
with check (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "notifications_update"
on public.notifications for update
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and (
    public.current_user_role() in ('ADMIN', 'RESPONSABLE')
    or (member_id is not null and member_id = public.current_member_id())
    or audience_role = public.current_user_role()
  )
)
with check (
  church_id = public.current_church_id()
  and (
    public.current_user_role() in ('ADMIN', 'RESPONSABLE')
    or (member_id is not null and member_id = public.current_member_id())
    or audience_role = public.current_user_role()
  )
);

create policy "notifications_delete"
on public.notifications for delete
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() = 'ADMIN'
);

-- member_participations
create policy "participations_select"
on public.member_participations for select
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and (
    public.current_user_role() in ('ADMIN', 'RESPONSABLE', 'MEMBRE')
    or member_id = public.current_member_id()
  )
);

create policy "participations_insert"
on public.member_participations for insert
with check (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "participations_update"
on public.member_participations for update
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
)
with check (
  church_id = public.current_church_id()
  and public.current_user_role() in ('ADMIN', 'RESPONSABLE')
);

create policy "participations_delete"
on public.member_participations for delete
using (
  auth.uid() is not null
  and church_id = public.current_church_id()
  and public.current_user_role() = 'ADMIN'
);
