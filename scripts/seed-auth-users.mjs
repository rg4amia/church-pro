/**
 * Crée les 4 utilisateurs de démo via l'API Admin Supabase.
 * Usage : node scripts/seed-auth-users.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌  Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CHURCH_ID = "00000000-0000-0000-0000-c00000000001";

const users = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    email: "admin@gesteglise.demo",
    password: "Password123!",
    full_name: "Apôtre Jean Mensah",
    role: "ADMIN",
    member_id: "10000000-0000-0000-0000-000000000001",
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    email: "responsable@gesteglise.demo",
    password: "Password123!",
    full_name: "Pasteur Ruth Yao",
    role: "RESPONSABLE",
    member_id: "10000000-0000-0000-0000-000000000002",
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    email: "membre@gesteglise.demo",
    password: "Password123!",
    full_name: "Samuel N'Guessan",
    role: "MEMBRE",
    member_id: "10000000-0000-0000-0000-000000000006",
  },
  {
    id: "a0000000-0000-0000-0000-000000000004",
    email: "visiteur@gesteglise.demo",
    password: "Password123!",
    full_name: "Clarisse Amani",
    role: "VISITEUR",
    member_id: "10000000-0000-0000-0000-000000000005",
  },
];

for (const user of users) {
  console.log(`\n→ Traitement de ${user.email}...`);

  // 1. Créer ou récupérer le user via Admin API
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: user.full_name },
  });

  if (createErr) {
    if (createErr.message?.includes("already been registered") || createErr.message?.includes("already exists")) {
      console.log(`  ℹ️  User existe déjà, mise à jour du mot de passe...`);
      // Récupérer l'ID existant
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email === user.email);
      if (existing) {
        await supabase.auth.admin.updateUserById(existing.id, {
          password: user.password,
          email_confirm: true,
        });
        console.log(`  ✅  Mot de passe mis à jour pour ${user.email}`);
      }
    } else {
      console.error(`  ❌  Erreur création ${user.email}:`, createErr.message);
    }
    continue;
  }

  const userId = created.user.id;
  console.log(`  ✅  User créé : ${userId}`);

  // 2. Mettre à jour le profil
  const { error: profileErr } = await supabase
    .from("profiles")
    .upsert({
      user_id: userId,
      display_name: user.full_name,
      role: user.role,
      member_id: user.member_id,
      church_id: CHURCH_ID,
    }, { onConflict: "user_id" });

  if (profileErr) {
    console.error(`  ❌  Erreur profil:`, profileErr.message);
  } else {
    console.log(`  ✅  Profil mis à jour (${user.role})`);
  }
}

console.log("\n✅  Seed terminé.");
