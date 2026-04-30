import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    titre?: string;
    canal?: string;
    audience_role?: string | null;
    member_id?: string | null;
  };

  return NextResponse.json({
    ok: true,
    mode: "mock",
    delivery_id: crypto.randomUUID(),
    titre: body.titre ?? "Notification",
    canal: body.canal ?? "realtime",
    audience_role: body.audience_role ?? null,
    member_id: body.member_id ?? null,
    delivered_at: new Date().toISOString(),
  });
}
