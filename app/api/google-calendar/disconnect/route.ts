import { NextRequest, NextResponse } from "next/server";

import {
  currentColaborador,
  decryptRefreshToken,
  serverSupabase,
} from "@/lib/server/google-calendar";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  try {
    const colaborador = await currentColaborador(
      request.headers.get("authorization")
    );
    const supabase = serverSupabase();
    const { data } = await supabase
      .from("google_calendar_connections")
      .select("refresh_token_encrypted")
      .eq("colaborador_id", colaborador.id)
      .maybeSingle();

    if (data?.refresh_token_encrypted) {
      await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token: decryptRefreshToken(data.refresh_token_encrypted),
        }),
      });
    }

    await supabase
      .from("google_calendar_connections")
      .delete()
      .eq("colaborador_id", colaborador.id);

    return NextResponse.json({ disconnected: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No fue posible desconectar Calendar." },
      { status: 400 }
    );
  }
}
