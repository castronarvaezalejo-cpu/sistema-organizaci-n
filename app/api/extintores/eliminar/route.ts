import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/lib/server/google-calendar";
import { eliminarEventoGoogleCalendar } from "@/lib/google-calendar-events";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { extintorId } = await request.json();

    if (!extintorId) {
      return NextResponse.json(
        { error: "Falta el ID del extintor." },
        { status: 400 }
      );
    }

    const { data: extintor, error } = await serverSupabase()
      .from("extintores")
      .select("*")
      .eq("id", extintorId)
      .single();



    if (error || !extintor) {
      return NextResponse.json(
        { error: "No se encontró el extintor." },
        { status: 404 }
      );
    }

    for (const evento of extintor.google_calendar_event_ids ?? []) {
       

      await eliminarEventoGoogleCalendar({
        eventId: evento.event_id,
        colaboradorId: evento.colaborador_id,
      });

      
    }

    const { error: deleteError } = await serverSupabase()
      .from("extintores")
      .delete()
      
      .eq("id", extintorId);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error interno",
      },
      {
        status: 500,
      }
    );
  }
}