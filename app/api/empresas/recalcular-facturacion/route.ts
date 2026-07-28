import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/lib/server/google-calendar";

export async function POST(req: NextRequest) {
console.log("=== RECALCULANDO FACTURACIÓN ===");
  try {
    const { empresaId } = await req.json();

    if (!empresaId) {
      return NextResponse.json(
        { error: "Falta empresaId" },
        { status: 400 }
      );
    }

    const supabase = serverSupabase();

    // Obtener la empresa
    const { data: empresa, error: empresaError } =
      await supabase
        .from("empresas")
        .select("tarifa_hora, horas_contratadas")
        .eq("id", empresaId)
        .single();

    if (empresaError || !empresa) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      );
    }

    const tarifaHora =
      Number(empresa.tarifa_hora || 0);

    const horasContratadas =
      Number(empresa.horas_contratadas || 0);

    if (horasContratadas <= 0) {
      return NextResponse.json(
        {
          error:
            "La empresa no tiene horas contratadas válidas.",
        },
        { status: 400 }
      );
    }

    // Obtener actividades
    const {
      data: actividades,
      error: actividadesError,
    } = await supabase
      .from("actividades_realizadas")
      .select("id, horas")
      .eq("empresa_id", empresaId);

    if (actividadesError) {
      throw actividadesError;
    }

    const actividadesCalculadas =
      (actividades || []).map((actividad) => {

      const totalFacturado =
        (tarifaHora / horasContratadas) *
        Number(actividad.horas || 0);

      return {
        id: actividad.id,
        total_facturado:
          Math.round(totalFacturado),
      };
    });

    const sumaTotal =
      actividadesCalculadas.reduce(
        (total, actividad) =>
          total + actividad.total_facturado,
        0
      );

    const diferencia =
      tarifaHora - sumaTotal;

    const ultimaActividad =
      actividadesCalculadas[
        actividadesCalculadas.length - 1
      ];

    console.log({
      tarifaHora,
      sumaTotal,
      diferencia,
      ultimaActividad,
    });

    if (
      diferencia !== 0 &&
      Math.abs(diferencia) <=
        actividadesCalculadas.length
    ) {
      console.log(
        "ENTRA AL AJUSTE DE REDONDEO"
      );

      if (ultimaActividad) {
        console.log({
          ultimaActividadAntes:
            ultimaActividad.total_facturado,
        });

        ultimaActividad.total_facturado +=
          diferencia;

        console.log({
          ultimaActividadDespues:
            ultimaActividad.total_facturado,
        });
      }
    } else {
      console.log(
        "NO ENTRA AL AJUSTE DE REDONDEO",
        {
          diferencia,
          cantidadActividades:
            actividadesCalculadas.length,
        }
      );
    }

    // Actualizar una por una
    for (const actividad of actividadesCalculadas) {

      const { error: updateError } =
        await supabase
        .from("actividades_realizadas")
        .update({
          total_facturado:
            actividad.total_facturado,
        })
        .eq("id", actividad.id);

      if (actividad.id === ultimaActividad?.id) {
        console.log({
          updateUltimaActividadEjecutado: true,
          ultimaActividadId: actividad.id,
          totalFacturadoGuardado:
            actividad.total_facturado,
          updateError,
        });
      }

      if (updateError) {
        console.error(
          "Error actualizando total_facturado",
          {
            actividadId: actividad.id,
            updateError,
          }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      actualizadas:
        actividades?.length || 0,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );

  }
}
