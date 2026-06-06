"use client"

import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabase"

export default function CalendarioPage() {

  const [tareas, setTareas] = useState<any[]>([])

  useEffect(() => {
    obtenerTareas()
  }, [])

  async function obtenerTareas() {

    const { data, error } = await supabase
      .from("tareas")
      .select(`
        *,
        empresas (
          nombre
        )
      `)
      .not("fecha_limite", "is", null)
      .order("fecha_limite", {
        ascending: true,
      })

    if (error) {
      console.error(error)
      return
    }

    setTareas(data || [])
  }

  // AGRUPAR POR FECHA

  const tareasAgrupadas = tareas.reduce(
    (
      acc: Record<string, any[]>,
      tarea: any
    ) => {

      const fecha =
        tarea.fecha_limite || "Sin fecha"

      if (!acc[fecha]) {
        acc[fecha] = []
      }

      acc[fecha].push(tarea)

      return acc

    },
    {}
  )

  return (
    <div>

      <h1 className="text-5xl font-black mb-3">
        Calendario
      </h1>

      <p className="text-zinc-400 mb-12 text-lg">
        Cronograma operativo de tareas
      </p>

      <div className="space-y-10">

        {Object.entries(tareasAgrupadas).map(
          ([fecha, tareasDelDia]) => (

            <div
              key={fecha}
              className="
                bg-zinc-900/60
                border
                border-zinc-800
                rounded-3xl
                p-8
                backdrop-blur-xl
              "
            >

              <h2 className="
                text-3xl
                font-black
                mb-8
              ">
                📅 {fecha}
              </h2>

              <div className="space-y-5">

                {(tareasDelDia as any[]).map(
                  (tarea: any) => (

                    <div
                      key={tarea.id}
                      className={`
                        border
                        rounded-2xl
                        p-5
                        flex
                        items-center
                        justify-between
                        transition
                        hover:scale-[1.01]

                        ${
                          tarea.estado === "completada"

                            ? "border-green-500/30 bg-green-500/10"

                            : tarea.prioridad === "alta"

                            ? "border-red-500/30 bg-red-500/10"

                            : tarea.prioridad === "media"

                            ? "border-yellow-500/30 bg-yellow-500/10"

                            : "border-blue-500/30 bg-blue-500/10"
                        }
                      `}
                    >

                      {/* LEFT */}

                      <div>

                        <h3 className="
                          font-bold
                          text-xl
                          mb-2
                        ">
                          {tarea.titulo}
                        </h3>

                        <p className="
                          text-zinc-400
                          text-sm
                        ">
                          {tarea.empresas?.nombre || "Sin empresa"}
                        </p>

                      </div>

                      {/* RIGHT */}

                      <div className="text-right">

                        <p className="
                          capitalize
                          font-semibold
                          text-lg
                        ">
                          {tarea.prioridad}
                        </p>

                        <p className="
                          text-sm
                          text-zinc-400
                          capitalize
                          mt-1
                        ">
                          {tarea.estado}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          )
        )}

      </div>

    </div>
  )
}