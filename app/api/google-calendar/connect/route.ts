import { randomBytes } from "crypto";

import { NextRequest, NextResponse } from "next/server";

import {
  currentColaborador,
  googleAuthorizationUrl,
} from "@/lib/server/google-calendar";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const colaborador = await currentColaborador(
      request.headers.get("authorization")
    );
const state = randomBytes(32).toString("base64url");

const authUrl = googleAuthorizationUrl(state);

console.log("AUTH URL:");
console.log(authUrl);

const response = NextResponse.json({
  authorizationUrl: authUrl,
});

    response.cookies.set("google_calendar_state", state, {
      httpOnly: true,
      maxAge: 10 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.set("google_calendar_colaborador", colaborador.id, {
      httpOnly: true,
      maxAge: 10 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No fue posible conectar Google Calendar." },
      { status: 401 }
    );
  }
}
