import { NextResponse } from "next/server";

import { serverSupabase } from "@/lib/server/google-calendar";

export async function POST(req: Request) {

  
  try {
const {
  titulo,
  prioridad,
  fechaLimite,
  colaboradorId,
  empresaNombre,
} = await req.json();

const { data: colaborador } = await serverSupabase()
  .from("colaboradores")
  .select("nombre, telefono")
  .eq("id", colaboradorId)
  .single();

if (!colaborador) {
  return NextResponse.json(
    {
      error: "No existe el colaborador.",
    },
    {
      status: 404,
    }
  );
}

const colaboradorNombre = colaborador.nombre;
const colaboradorTelefono = colaborador.telefono;

    // Validar teléfono
    if (!colaboradorTelefono) {
      return NextResponse.json(
        {
          error: "El colaborador no tiene teléfono.",
        },
        {
          status: 400,
        }
      );
    }

    // Convertir a formato internacional
    const telefono = colaboradorTelefono
      .replace(/\D/g, "")
      .startsWith("57")
      ? colaboradorTelefono.replace(/\D/g, "")
      : "57" + colaboradorTelefono.replace(/\D/g, "");

    // Mensaje de WhatsApp
    const mensaje = `📋 *Nueva tarea asignada*

Hola ${colaboradorNombre}.

Se te ha asignado una nueva tarea desde *SEITON Soluciones Empresariales*.

🏢 Empresa:
${empresaNombre}

📝 Tarea:
${titulo}

⚡ Prioridad:
${prioridad}

📅 Fecha límite:
${fechaLimite}

Por favor ingresa a la plataforma para revisar toda la información.`;

    console.log("=================================");
    console.log("📲 Enviando mensaje de WhatsApp");
    console.log("Número:", telefono);
    console.log("Mensaje:");
    console.log(mensaje);
    console.log("TOKEN:", process.env.WHATSAPP_TOKEN?.substring(0, 20));
    console.log("PHONE ID:", process.env.WHATSAPP_PHONE_NUMBER_ID);
    console.log("BUSINESS ID:", process.env.WHATSAPP_BUSINESS_ACCOUNT_ID);
    console.log("=================================");


    console.log("===== DATOS RECIBIDOS =====");
console.log({
  titulo,
  prioridad,
  fechaLimite,
  colaboradorNombre,
  colaboradorTelefono,
  empresaNombre,
});

    const respuesta = await fetch(
      `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: telefono,
type: "template",
template: {
  name: "nueva_tarea",
  language: {
    code: "es_CO",
  },
  components: [
    {
      type: "body",
      parameters: [
        {
          type: "text",
          text: colaboradorNombre,
        },
        {
          type: "text",
          text: empresaNombre,
        },
        {
          type: "text",
          text: titulo,
        },
        {
          type: "text",
          text: prioridad,
        },
        {
          type: "text",
          text: fechaLimite,
        },
      ],
    },
  ],
},
        }),
      }
    );

    const resultado = await respuesta.json();

    console.log("MENSAJE COMPLETO:");
console.dir(resultado, { depth: null });

    console.log("STATUS META:", respuesta.status);
console.log("RESULTADO META:", resultado);

    console.log("=================================");
    console.log("Status:", respuesta.status);
    console.log("Respuesta de Meta:");
    console.log(resultado);
    console.log("=================================");

return NextResponse.json(
  {
    status: respuesta.status,
    resultado,
  },
  {
    status: respuesta.status,
  }
);
  } catch (error) {
    console.error("Error enviando WhatsApp:", error);

    return NextResponse.json(
      {
        error: "Error interno del servidor",
      },
      {
        status: 500,
      }
    );
  }
}