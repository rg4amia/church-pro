import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/env";
import { createChurchSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  if (!hasServiceRole) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY manquant." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as unknown;
  const parsed = createChurchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 },
    );
  }

  const { nom, slug, email, password } = parsed.data;
  const supabase = createSupabaseAdminClient();

  const slugCheck = await supabase.from("churches").select("id").eq("slug", slug).maybeSingle();
  if (slugCheck.data) {
    return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 409 });
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: nom },
  });
  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Erreur création compte" },
      { status: 400 },
    );
  }

  const userId = authData.user.id;

  const { data: church, error: churchError } = await supabase
    .from("churches")
    .insert({ nom, slug })
    .select("id, slug")
    .single();
  if (churchError || !church) {
    await supabase.auth.admin.deleteUser(userId);
    return NextResponse.json(
      { error: churchError?.message ?? "Erreur création église" },
      { status: 400 },
    );
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ church_id: church.id, role: "ADMIN" })
    .eq("user_id", userId);
  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    await supabase.from("churches").delete().eq("id", church.id);
    return NextResponse.json(
      { error: profileError.message },
      { status: 400 },
    );
  }

  return NextResponse.json({ slug: church.slug }, { status: 201 });
}
