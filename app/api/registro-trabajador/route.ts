import { NextResponse } from "next/server";

import { serverSupabase } from "@/lib/server/google-calendar";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const nombre = String(formData.get("nombre") || "").trim();
    const correo = String(formData.get("correo") || "").trim();
    const password = String(formData.get("password") || "");
    const telefono = String(formData.get("telefono") || "").trim();
    const fechaNacimiento = String(
      formData.get("fechaNacimiento") || ""
    );
    const empresaId = String(formData.get("empresaId") || "");
    const cargo = String(formData.get("cargo") || "").trim();
    const foto = formData.get("foto");

    if (
      !nombre ||
      !correo ||
      !password ||
      !telefono ||
      !fechaNacimiento ||
      !empresaId ||
      !cargo
    ) {
      return NextResponse.json(
        { error: "Completa todos los campos obligatorios." },
        { status: 400 }
      );
    }

    const supabase = serverSupabase();

    const { data: empresa } = await supabase
      .from("empresas")
      .select("id")
      .eq("id", empresaId)
      .eq("activa", true)
      .single();

    if (!empresa) {
      return NextResponse.json(
        { error: "La empresa seleccionada no está disponible." },
        { status: 400 }
      );
    }

    const { data: usuario, error: authError } =
      await supabase.auth.admin.createUser({
        email: correo,
        password,
        email_confirm: true,
        user_metadata: {
          rol: "trabajador",
          nombre,
        },
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    let fotoPath: string | null = null;

    if (foto instanceof File && foto.size > 0) {
      const extension =
        foto.name.split(".").pop() || "jpg";
      fotoPath = `${usuario.user.id}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("trabajadores")
        .upload(fotoPath, foto, {
          contentType: foto.type,
          upsert: true,
        });

      if (uploadError) {
        fotoPath = null;
      }
    }

    const { error: trabajadorError } = await supabase
      .from("trabajadores_empresa")
      .insert({
        empresa_id: empresaId,
        nombre,
        correo,
        telefono,
        fecha_nacimiento: fechaNacimiento,
        cargo,
        estado: "activo",
        foto_url: fotoPath,
      });

    if (trabajadorError) {
      await supabase.auth.admin.deleteUser(usuario.user.id);

      return NextResponse.json(
        { error: trabajadorError.message },
        { status: 400 }
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
            : "No fue posible registrar el trabajador.",
      },
      { status: 500 }
    );
  }
}
