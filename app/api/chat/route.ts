import { supabase }
from "@/lib/supabase";

import OpenAI from "openai";

const client =
  new OpenAI({

    apiKey:
     process.env.GROQ_API_KEY,

    baseURL:
      "https://api.groq.com/openai/v1",
  });

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json();

    const mensaje =
      body.mensaje;

    // ===================================
    // EMPRESAS
    // ===================================

    const {
      data: empresas,
    } = await supabase
      .from("empresas")
      .select("*");

    // ===================================
    // EXTINTORES
    // ===================================

    const {
      data: extintores,
    } = await supabase
      .from("extintores")
      .select(`
        *,
        empresas (
          nombre
        )
      `);

    // ===================================
    // TAREAS
    // ===================================

    const {
      data: tareas,
    } = await supabase
      .from("tareas")
      .select(`
        *,
        empresas (
          nombre
        )
      `);

    // ===================================
    // CONTEXTO IA
    // ===================================

    const contexto =
`
Eres el asistente empresarial de SEITON.

Tu trabajo es analizar la información
del sistema y responder profesionalmente.

==============================
EMPRESAS
==============================

${JSON.stringify(empresas)}

==============================
EXTINTORES
==============================

${JSON.stringify(extintores)}

==============================
TAREAS
==============================

${JSON.stringify(tareas)}

==============================
PREGUNTA DEL USUARIO
==============================

${mensaje}
`;

    // ===================================
    // IA
    // ===================================

    const completion =
      await client.chat.completions.create({

        model:
          "llama-3.3-70b-versatile",

        messages: [

          {
            role: "system",

            content:
`
Eres la IA empresarial
de SEITON.

Analiza cuidadosamente
la información entregada.

Responde:
- claro
- profesional
- resumido
- inteligente
`,
          },

          {
            role: "user",

            content:
              contexto,
          },
        ],
      });

    return Response.json({

      respuesta:
        completion
          .choices?.[0]
          ?.message?.content
          || "Sin respuesta",
    });

  } catch (error) {

    console.log(error);

    return Response.json({

      respuesta:
        "Error conectando Groq",
    });
  }
}