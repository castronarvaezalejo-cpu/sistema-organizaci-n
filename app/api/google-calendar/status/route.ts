import { NextRequest, NextResponse } from "next/server";

import {
  currentColaborador,
  serverSupabase,
} from "@/lib/server/google-calendar";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const colaborador = await currentColaborador(
      request.headers.get("authorization")
    );
    const { data } = await serverSupabase()
      .from("google_calendar_connections")
      .select("google_email, connected_at")
      .eq("colaborador_id", colaborador.id)
      .maybeSingle();

    return NextResponse.json({ connection: data || null });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No fue posible consultar Calendar." },
      { status: 401 }
    );
  }
}
