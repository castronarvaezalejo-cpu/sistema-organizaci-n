import { NextRequest, NextResponse } from "next/server";

import {
  accessTokenFromRefreshToken,
  currentColaborador,
  decryptRefreshToken,
  serverSupabase,
} from "@/lib/server/google-calendar";

type CalendarEventRequest = {
  eventId?: string;
  colaboradorId: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  durationMinutes?: number;
  location?: string;
};

export const runtime = "nodejs";

function calendarTimes({ date, time, durationMinutes = 60 }: CalendarEventRequest) {
  if (!time) {
    const nextDate = new Date(`${date}T00:00:00`);
    nextDate.setDate(nextDate.getDate() + 1);

    return {
      start: { date },
      end: { date: nextDate.toISOString().slice(0, 10) },
    };
  }

  const start = new Date(`${date}T${time}:00-05:00`);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  return {
    start: {
      dateTime: start.toISOString(),
      timeZone: "America/Bogota",
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: "America/Bogota",
    },
  };
}

async function googleAccessToken(colaboradorId: string) {

  console.log("=================================");
  console.log("BUSCANDO TOKEN PARA:", colaboradorId);

  const { data: connection } = await serverSupabase()
    .from("google_calendar_connections")
    .select("colaborador_id, google_email, refresh_token_encrypted")
    .eq("colaborador_id", colaboradorId)
    .maybeSingle();

  console.log("CONEXIÓN ENCONTRADA:");
  console.dir(connection, { depth: null });
  console.log("=================================");

  if (!connection) {
    return null;
  }

  return accessTokenFromRefreshToken(
    decryptRefreshToken(connection.refresh_token_encrypted)
  );
}

export async function POST(request: NextRequest) {
  try {
    const requester = await currentColaborador(
      request.headers.get("authorization")
    );
    const event = (await request.json()) as CalendarEventRequest;

    if (!event.colaboradorId || !event.title || !event.date) {
      return NextResponse.json(
        { error: "Faltan datos del evento." },
        { status: 400 }
      );
    }

    if (requester.rol !== "admin" && requester.id !== event.colaboradorId) {
      return NextResponse.json(
        { error: "No tienes permiso para crear este evento." },
        { status: 403 }
      );
    }

console.log("CREANDO EVENTO PARA:");
console.log(event.colaboradorId);
console.log(event.title);

const accessToken = await googleAccessToken(event.colaboradorId);

if (!accessToken) {
  return NextResponse.json(
    {
      skipped: true,
      reason: "El colaborador no ha conectado Google Calendar.",
    },
    { status: 200 }
  );
}
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: event.title,
          description: event.description,
          location: event.location,
          ...calendarTimes(event),
          reminders: {
            useDefault: false,
            overrides: [
              { method: "popup", minutes: 60 },
              { method: "popup", minutes: 24 * 60 },
            ],
          },
        }),
      }
    );

if (!response.ok) {
  const googleError = await response.text();
  console.error("GOOGLE API ERROR:", googleError);

  throw new Error(googleError);
}
    const calendarEvent = await response.json();

    return NextResponse.json({
      created: true,
      eventId: calendarEvent.id,
    });
  } catch (error) {
  console.error("ERROR GOOGLE CALENDAR:");
  console.error(error);

  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : String(error),
    },
    {
      status: 500,
    }
  );
}
}

export async function PATCH(request: NextRequest) {
  try {
    const requester = await currentColaborador(
      request.headers.get("authorization")
    );

    const event = (await request.json()) as CalendarEventRequest;

if (
  !event.eventId ||
  !event.colaboradorId ||
  !event.title ||
  !event.date
) {
  return NextResponse.json(
    { error: "Faltan datos del evento." },
    { status: 400 }
  );
}

if (
  requester.rol !== "admin" &&
  requester.id !== event.colaboradorId
) {
  return NextResponse.json(
    { error: "No tienes permiso para actualizar este evento." },
    { status: 403 }
  );
}

const accessToken = await googleAccessToken(event.colaboradorId);

if (!accessToken) {
  return NextResponse.json(
    {
      skipped: true,
      reason: "El colaborador no ha conectado Google Calendar.",
    },
    { status: 200 }
  );
}

const response = await fetch(
  `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.eventId}`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: event.title,
      description: event.description,
      location: event.location,
      ...calendarTimes(event),
    }),
  }
);

if (!response.ok) {
  const googleError = await response.text();
  console.error("GOOGLE API ERROR:", googleError);

  throw new Error(googleError);
}

return NextResponse.json({
  updated: true,
  version: "NUEVA_VERSION_123",
});

  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No fue posible actualizar el evento.",
      },
      { status: 500 }
    );
  }
}