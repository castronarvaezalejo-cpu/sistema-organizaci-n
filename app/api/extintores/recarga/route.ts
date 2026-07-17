import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/lib/server/google-calendar";


import { actualizarEventoGoogleCalendar } from "@/lib/google-calendar-events";
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

    console.log("RECARGANDO:", extintorId);

    const { data: extintor, error } = await serverSupabase()
  .from("extintores")
  .select(`
  *,
  empresas (
    nombre
  )
`)
  .eq("id", extintorId)
  .single();

if (error || !extintor) {
  return NextResponse.json(
    {
      error: "No se encontró el extintor.",
    },
    {
      status: 404,
    }
  );
}

console.log("EXTINTOR ENCONTRADO:");
console.log(JSON.stringify(extintor, null, 2));

const fechaRecarga = new Date().toISOString().split("T")[0];

const { error: updateError } = await serverSupabase()
  .from("extintores")
  .update({
    fecha_recarga: fechaRecarga,
  })
  .eq("id", extintorId);

if (updateError) {
  return NextResponse.json(
    {
      error: updateError.message,
    },
    {   
      status: 500,
    }
  );
}

console.log("Fecha de recarga actualizada:", fechaRecarga);

const fechaVencimiento = new Date(fechaRecarga);
fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);

for (const evento of extintor.google_calendar_event_ids ?? []) {
  await actualizarEventoGoogleCalendar({
    eventId: evento.event_id,
    colaboradorId: evento.colaborador_id,
    title: `🧯 Recarga Extintor ${extintor.codigo}`,
    description: `Empresa: ${extintor.empresas?.nombre ?? ""}

Ubicación: ${extintor.ubicacion}

Tipo: ${extintor.tipo}

Capacidad: ${extintor.capacidad}`,
    date: fechaVencimiento.toISOString().split("T")[0],
  });
}

    return NextResponse.json({
      ok: true,
      extintorId,
    });




  }
  


  catch (error) {

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