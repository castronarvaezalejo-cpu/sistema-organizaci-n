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

    // Actualizar una por una
    for (const actividad of actividades || []) {

      const totalFacturado =
        (tarifaHora / horasContratadas) *
        Number(actividad.horas || 0);

      await supabase
        .from("actividades_realizadas")
        .update({
          total_facturado:
            Math.round(totalFacturado),
        })
        .eq("id", actividad.id);
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