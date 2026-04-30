-- -------------------------------------------------------
-- Fix : dépendance circulaire RLS churches
--
-- L'ancienne policy appelait current_church_id() qui lit
-- profiles.church_id — mais ce join était lui-même bloqué
-- par la RLS de churches, rendant church_slug toujours null.
--
-- Nouvelle policy : un user authentifié peut lire une église
-- si son profil référence cet id (lookup direct, sans fonction).
-- -------------------------------------------------------

drop policy if exists "churches_select" on public.churches;
create policy "churches_select"
on public.churches for select
using (
  auth.uid() is not null
  and exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and church_id = churches.id
  )
);
