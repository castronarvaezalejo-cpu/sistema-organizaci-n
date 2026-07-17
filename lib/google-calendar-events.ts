import {
  accessTokenFromRefreshToken,
  decryptRefreshToken,
  serverSupabase,
} from "@/lib/server/google-calendar";

type ActualizarEventoParams = {
  eventId: string;
  colaboradorId: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
};

function calendarTimes({
  date,
}: {
  date: string;
}) {
  const nextDate = new Date(`${date}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + 1);

  return {
    start: { date },
    end: { date: nextDate.toISOString().slice(0, 10) },
  };
}

async function googleAccessToken(colaboradorId: string) {
  const { data: connection } = await serverSupabase()
    .from("google_calendar_connections")
    .select("refresh_token_encrypted")
    .eq("colaborador_id", colaboradorId)
    .maybeSingle();

  if (!connection) {
    throw new Error("El colaborador no tiene Google Calendar conectado.");
  }

  return accessTokenFromRefreshToken(
    decryptRefreshToken(connection.refresh_token_encrypted)
  );
}

export async function actualizarEventoGoogleCalendar({
  eventId,
  colaboradorId,
  title,
  description,
  date,
  location,
}: ActualizarEventoParams)


{
  const accessToken = await googleAccessToken(colaboradorId);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: title,
        description,
        location,
        ...calendarTimes({ date }),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function eliminarEventoGoogleCalendar({
  eventId,
  colaboradorId,
}: {
  eventId: string;
  colaboradorId: string;
}) {
  const accessToken = await googleAccessToken(colaboradorId);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error(await response.text());
  }
}