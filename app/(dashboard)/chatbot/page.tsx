"use client";

import { useState } from "react";

import {
  Bot,
  Send,
  User,
} from "lucide-react";

export default function ChatbotPage() {

  const [
    mensaje,
    setMensaje,
  ] = useState("");

  const [
    respuesta,
    setRespuesta,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function enviarMensaje() {

    if (!mensaje.trim()) return;

    setLoading(true);

    try {

      const response =
        await fetch(
          "/api/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              mensaje,
            }),
          }
        );

      const data =
        await response.json();

      setRespuesta(
        data.respuesta
      );

    } catch (error) {

      console.error(error);

      setRespuesta(
        "Error conectando IA"
      );

    } finally {

      setLoading(false);
    }
  }

  return (

    <div className="
      max-w-5xl
      mx-auto
      p-6
    ">

      {/* HEADER */}

      <div className="
        mb-8
      ">

        <h1 className="
          text-4xl
          font-bold
          mb-2
        ">
          ChatBot SEITON
        </h1>

        <p className="
          text-zinc-400
        ">
          Consulta rápida inteligente
        </p>

      </div>

      {/* CHAT */}

      <div className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        overflow-hidden
      ">

        {/* RESPUESTAS */}

        <div className="
          p-6
          min-h-[500px]
          space-y-6
        ">

          {/* USER */}

          {mensaje && (

            <div className="
              flex
              justify-end
            ">

              <div className="
                bg-blue-600
                rounded-2xl
                px-5
                py-4
                max-w-[80%]
              ">

                <div className="
                  flex
                  items-center
                  gap-2
                  mb-2
                ">

                  <User size={18} />

                  <span className="
                    text-sm
                    font-medium
                  ">
                    Tú
                  </span>

                </div>

                <p>
                  {mensaje}
                </p>

              </div>

            </div>
          )}

          {/* BOT */}

          <div className="
            flex
            justify-start
          ">

            <div className="
              bg-black/40
              border
              border-zinc-800
              rounded-2xl
              px-5
              py-4
              max-w-[80%]
              whitespace-pre-line
            ">

              <div className="
                flex
                items-center
                gap-2
                mb-3
              ">

                <Bot size={18} />

                <span className="
                  text-sm
                  font-medium
                ">
                  SEITON
                </span>

              </div>

              <p className="
                text-zinc-200
                leading-7
              ">

                {loading
                  ? "Consultando..."
                  : respuesta || `
Bienvenido al ChatBot SEITON.

Prueba:

• ¿Qué puedes hacer?
• ¿Qué empresas tienen más riesgo?
• ¿Qué extintores están vencidos?
• Hazme un resumen de alertas
                  `
                }

              </p>

            </div>

          </div>

        </div>

        {/* INPUT */}

        <div className="
          border-t
          border-zinc-800
          p-5
          flex
          gap-3
        ">

          <input
            value={mensaje}
            onChange={(e) =>
              setMensaje(
                e.target.value
              )
            }
            onKeyDown={(e) => {

              if (
                e.key === "Enter"
              ) {

                enviarMensaje();
              }
            }}
            placeholder="
Escribe un mensaje...
            "
            className="
              flex-1
              bg-black/40
              border
              border-zinc-800
              rounded-xl
              px-5
              py-4
              outline-none
            "
          />

          <button
            onClick={
              enviarMensaje
            }
            className="
              bg-blue-600
              hover:bg-blue-700
              transition
              px-6
              rounded-xl
              flex
              items-center
              gap-2
              font-medium
            "
          >

            <Send size={18} />

            Enviar

          </button>

        </div>

      </div>

    </div>
  );
}