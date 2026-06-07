"use client"

import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabase"

export default function AlertasPage() {

  const [alertas, setAlertas] = useState<any[]>([])

  useEffect(() => {
    obtenerAlertas()
  }, [])

  async function obtenerAlertas() {

    const hoy = new Date()

    const manana = new Date()

    manana.setDate(hoy.getDate() + 1)

    const { data } = await supabase
      .from("tareas")
      .select(`
        *,
        empresas (
          nombre
        ),
        colaboradores (
          nombre
        )
      `)
      .neq("estado", "completada")
      .order("fecha_limite", {
        ascending: true,
      })

    if (!data) return

    const resultado = data.map((tarea: any) => {

      const fecha = new Date(
        tarea.fecha_limite
      )

      let tipo = "proxima"

      if (fecha < hoy) {

        tipo = "vencida"

      } else if (
        fecha.toDateString() ===
        hoy.toDateString()
      ) {

        tipo = "hoy"

      }

      return {
        ...tarea,
        tipo,
      }
    })

    setAlertas(resultado)
  }

  return (
    <div>

      <h1 className="text-4xl font-bold mb-2">
        Alertas
      </h1>

      <p className="text-zinc-400 mb-10">
        Seguimiento automático de tareas
      </p>

      <div className="space-y-5">

        {alertas.map((alerta) => (

          <div
            key={alerta.id}
            className={`
              border rounded-2xl p-6 transition

              ${alerta.tipo === "vencida"
                ? "border-red-500 bg-red-500/10"

                : alerta.tipo === "hoy"
                ? "border-yellow-500 bg-yellow-500/10"

                : "border-blue-500 bg-blue-500/10"
              }
            `}
          >

            <div className="flex items-start justify-between gap-6">

              <div>

                <h2 className="text-xl font-semibold mb-2">

                  {alerta.titulo}

                </h2>

                <p className="text-zinc-300 mb-2">

                  Empresa:
                  {" "}
                  {alerta.empresas?.nombre}

                </p>

                <p className="text-zinc-400">

                  Responsable:
                  {" "}
                  {alerta.colaboradores?.nombre || "-"}

                </p>

              </div>

              <div className="text-right">

                <p className="text-sm text-zinc-400 mb-2">

                  {alerta.fecha_limite}

                </p>

                <span
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium

                    ${alerta.tipo === "vencida"
                      ? "bg-red-500/20 text-red-400"

                      : alerta.tipo === "hoy"
                      ? "bg-yellow-500/20 text-yellow-400"

                      : "bg-blue-500/20 text-blue-400"
                    }
                  `}
                >

                  {alerta.tipo === "vencida"
                    ? "Vencida"

                    : alerta.tipo === "hoy"
                    ? "Vence Hoy"

                    : "Próxima"
                  }

                </span>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}