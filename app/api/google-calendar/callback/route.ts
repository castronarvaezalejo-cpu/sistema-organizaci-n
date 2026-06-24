import { NextRequest, NextResponse } from "next/server";

import {
  encryptRefreshToken,
  exchangeGoogleCode,
  googleEmail,
  serverSupabase,
} from "@/lib/server/google-calendar";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const errorUrl = new URL("/calendario?google=error", request.url);
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const cookieState = request.cookies.get("google_calendar_state")?.value;
  const colaboradorId = request.cookies.get(
    "google_calendar_colaborador"
  )?.value;

    console.log("STATE URL:", state);
  console.log("CODE:", code ? "SI" : "NO");
  console.log("COOKIE STATE:", cookieState);
  console.log("COLABORADOR:", colaboradorId);

  if (!state || !code || !cookieState || state !== cookieState || !colaboradorId) {
    return NextResponse.redirect(errorUrl);
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    const email = await googleEmail(tokens.access_token);
    const supabase = serverSupabase();
    const { error } = await supabase
      .from("google_calendar_connections")
      .upsert({
        colaborador_id: colaboradorId,
        google_email: email,
        refresh_token_encrypted: encryptRefreshToken(tokens.refresh_token),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("SUPABASE ERROR:", error);
      throw error;
    }

    const successUrl = new URL("/calendario?google=connected", request.url);
    const response = NextResponse.redirect(successUrl);
    response.cookies.delete("google_calendar_state");
    response.cookies.delete("google_calendar_colaborador");

    return response;
  } catch (error) {
    console.error("GOOGLE CALLBACK ERROR:", error);
    return NextResponse.redirect(errorUrl);
  }
}
