-- -------------------------------------------------------
-- Fix : réécriture de la policy profiles sans récursion
--
-- L'ancienne policy appelait current_user_role() depuis
-- une query sur profiles → récursion infinie.
--
-- Nouvelle policy : lecture directe par user_id (self),
-- ou lookup direct du rôle sans passer par la policy.
-- -------------------------------------------------------

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
drop policy if exists "profiles_update_self_or_admin" on public.profiles;
-- Lecture : chaque user lit son propre profil.
-- Les admins utilisent le service role côté serveur.
create policy "profiles_select_self"
on public.profiles for select
using (auth.uid() is not null and user_id = auth.uid());
-- Mise à jour : self ou admin via lookup direct (pas de fonction récursive)
create policy "profiles_update_self_or_admin"
on public.profiles for update
using (
  auth.uid() is not null
  and (
    user_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'ADMIN'
    )
  )
)
with check (
  user_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'ADMIN'
  )
);
