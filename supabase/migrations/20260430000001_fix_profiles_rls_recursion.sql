-- -------------------------------------------------------
-- Fix : récursion infinie dans profiles RLS
--
-- current_user_role() faisait un SELECT sur profiles,
-- déclenchant la policy profiles_select_self_or_admin,
-- qui appelait à nouveau current_user_role() → stack overflow.
--
-- Solution : SECURITY DEFINER permet à la fonction de
-- bypasser la RLS et lire profiles directement.
-- -------------------------------------------------------

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
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
security definer
set search_path = public
as $$
  select member_id from public.profiles where user_id = auth.uid();
$$;
