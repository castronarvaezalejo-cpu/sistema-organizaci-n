import { NextRequest, NextResponse } from "next/server";

import {
  currentColaborador,
  serverSupabase,
} from "@/lib/server/google-calendar";

export const runtime = "nodejs";

type FacturarRequest = {
  actividadIds?: string[];
  cuentaCobroId?: string;
};

function fechaBogota() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Bogota",
  });
}

export async function POST(request: NextRequest) {
  try {
    await currentColaborador(
      request.headers.get("authorization")
    );

    const body =
      (await request.json()) as FacturarRequest;

    const actividadIds =
      body.actividadIds?.filter(Boolean) || [];

    if (
      actividadIds.length === 0 ||
      !body.cuentaCobroId
    ) {
      return NextResponse.json(
        {
          error:
            "Faltan actividades o identificador de cuenta de cobro.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await serverSupabase()
      .from("actividades_realizadas")
      .update({
        facturada: true,
        fecha_facturacion: fechaBogota(),
        cuenta_cobro_id: body.cuentaCobroId,
      })
      .in("id", actividadIds)
      .select("id");

    if (error) {
      throw error;
    }

    if (!data || data.length !== actividadIds.length) {
      return NextResponse.json(
        {
          error:
            "No se actualizaron todas las actividades seleccionadas.",
          actualizadas: data?.length || 0,
          esperadas: actividadIds.length,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      cuentaCobroId: body.cuentaCobroId,
      actualizadas: data.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No fue posible marcar las actividades como facturadas.",
      },
      { status: 500 }
    );
  }
}
