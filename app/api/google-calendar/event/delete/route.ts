import { NextRequest, NextResponse } from "next/server";

import {
  currentColaborador,
  serverSupabase,
  decryptRefreshToken,
  accessTokenFromRefreshToken,
} from "@/lib/server/google-calendar";

export async function DELETE(request: NextRequest) {
  try {
    const requester = await currentColaborador(
      request.headers.get("authorization")
    );

    const { eventId, colaboradorId } = await request.json();

    if (!eventId || !colaboradorId) {
      return NextResponse.json(
        { error: "Faltan datos." },
        { status: 400 }
      );
    }

    if (
      requester.rol !== "admin" &&
      requester.id !== colaboradorId
    ) {
      return NextResponse.json(
        { error: "Sin permisos." },
        { status: 403 }
      );
    }

    const { data: connection } = await serverSupabase()
      .from("google_calendar_connections")
      .select("refresh_token_encrypted")
      .eq("colaborador_id", colaboradorId)
      .single();

      if (!connection) {
  return NextResponse.json(
    {
      error: "El colaborador no tiene Google Calendar conectado.",
    },
    { status: 404 }
  );
}

    const accessToken = await accessTokenFromRefreshToken(
      decryptRefreshToken(connection.refresh_token_encrypted)
    );

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

if (!response.ok) {

  const googleError =
    await response.text();

  // Si el evento ya no existe,
  // lo tratamos como eliminado.

  if (response.status === 404) {

    return NextResponse.json({
      deleted: true,
      alreadyDeleted: true,
    });

  }

  throw new Error(googleError);

}
    return NextResponse.json({
      deleted: true,
    });

  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No fue posible eliminar.",
      },
      { status: 500 }
    );
  }
}