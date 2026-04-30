import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env, isSupabaseConfigured } from "@/lib/env";
import type { Viewer, UserRole } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEMO_CHURCH_ID = "demo-church";
const DEMO_CHURCH_SLUG = "demo";
const DEMO_CHURCH_NOM = "Église Démo";

function getDemoViewer(roleOverride?: UserRole): Viewer {
  const role = roleOverride ?? env.demoRole;

  return {
    id: `demo-${role.toLowerCase()}`,
    email: `${role.toLowerCase()}@gesteglise.demo`,
    display_name:
      role === "ADMIN"
        ? "Apôtre Démonstration"
        : role === "RESPONSABLE"
          ? "Responsable Démonstration"
          : role === "MEMBRE"
            ? "Membre Démonstration"
            : "Visiteur Démonstration",
    role,
    member_id: null,
    church_id: DEMO_CHURCH_ID,
    church_slug: DEMO_CHURCH_SLUG,
    church_nom: DEMO_CHURCH_NOM,
    is_demo: true,
  };
}

export const getCurrentViewer = cache(async (roleOverride?: UserRole) => {
  if (!isSupabaseConfigured) {
    const cookieStore = await cookies();
    const cookieRole = cookieStore.get("demo-role")?.value as UserRole | undefined;
    return getDemoViewer(roleOverride ?? cookieRole);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, member_id, church_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Requête séparée pour l'église : évite la dépendance circulaire entre
  // la RLS de churches (qui appelle current_church_id()) et la lecture du profil.
  let church: { slug: string; nom: string } | null = null;
  if (profile?.church_id) {
    const { data: churchData } = await supabase
      .from("churches")
      .select("slug, nom")
      .eq("id", profile.church_id)
      .maybeSingle();
    church = churchData;
  }

  return {
    id: user.id,
    email: user.email ?? "utilisateur@gesteglise.app",
    display_name: profile?.display_name ?? user.user_metadata.full_name ?? "Utilisateur",
    role: profile?.role ?? "MEMBRE",
    member_id: profile?.member_id ?? null,
    church_id: profile?.church_id ?? "",
    church_slug: church?.slug ?? "",
    church_nom: church?.nom ?? "",
    is_demo: false,
  } satisfies Viewer;
});

export async function requireViewer(roleOverride?: UserRole) {
  const viewer = await getCurrentViewer(roleOverride);

  if (!viewer) {
    redirect("/sign-in");
  }

  return viewer;
}
