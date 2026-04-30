import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/env";
import { getCurrentViewer } from "@/lib/auth";
import {
  cellFormSchema,
  departmentFormSchema,
  inventoryFormSchema,
  memberFormSchema,
  newcomerFormSchema,
  notificationFormSchema,
  serviceFormSchema,
  sermonFormSchema,
} from "@/lib/validation/schemas";

const entityConfig = {
  members: { table: "members", schema: memberFormSchema },
  cells: { table: "prayer_cells", schema: cellFormSchema },
  services: { table: "worship_services", schema: serviceFormSchema },
  newcomers: { table: "newcomer_followups", schema: newcomerFormSchema },
  departments: { table: "departments", schema: departmentFormSchema },
  inventory: { table: "inventory_items", schema: inventoryFormSchema },
  sermons: { table: "sermons", schema: sermonFormSchema },
  notifications: { table: "notifications", schema: notificationFormSchema },
} as const;

type EntityKey = keyof typeof entityConfig;

async function getEntityContext(params: Promise<{ entity: string }>) {
  const { entity } = await params;
  if (!(entity in entityConfig)) {
    return null;
  }

  return entityConfig[entity as EntityKey];
}

function buildClient() {
  if (!hasServiceRole) {
    return null;
  }

  return createSupabaseAdminClient();
}

async function resolveViewer() {
  const viewer = await getCurrentViewer();
  if (!viewer || !viewer.church_id) {
    return null;
  }
  return viewer;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  const [config, viewer] = await Promise.all([getEntityContext(params), resolveViewer()]);

  if (!config) {
    return NextResponse.json({ error: "Entité inconnue" }, { status: 404 });
  }

  if (!viewer) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const supabase = buildClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY manquant pour les écritures." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { payload?: Record<string, unknown> };
  const parsed = config.schema.safeParse(body.payload ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalide" }, { status: 400 });
  }

  const tableName = config.table as never;
  const { data, error } = await supabase
    .from(tableName)
    .insert({ ...(parsed.data as object), church_id: viewer.church_id } as never)
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  const [config, viewer] = await Promise.all([getEntityContext(params), resolveViewer()]);

  if (!config) {
    return NextResponse.json({ error: "Entité inconnue" }, { status: 404 });
  }

  if (!viewer) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const supabase = buildClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY manquant pour les écritures." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { id?: string; payload?: Record<string, unknown> };
  if (!body.id) {
    return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
  }

  const parsed = config.schema.safeParse(body.payload ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Payload invalide" }, { status: 400 });
  }

  const tableName = config.table as never;
  const { data, error } = await supabase
    .from(tableName)
    .update(parsed.data as never)
    .eq("id", body.id)
    .eq("church_id", viewer.church_id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  const [config, viewer] = await Promise.all([getEntityContext(params), resolveViewer()]);

  if (!config) {
    return NextResponse.json({ error: "Entité inconnue" }, { status: 404 });
  }

  if (!viewer) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const supabase = buildClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY manquant pour les écritures." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { id?: string };
  if (!body.id) {
    return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
  }

  const tableName = config.table as never;
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq("id", body.id)
    .eq("church_id", viewer.church_id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
