"use client"

import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabase"

export default function CalendarioPage() {

  const [tareas, setTareas] = useState<any[]>([])

  useEffect(() => {
    obtenerTareas()
  }, [])

  async function obtenerTareas() {

    const { data } = await supabase
      .from("tareas")
      .select(`
        *,
        empresas (
          nombre
        )
      `)
      .not("fecha_limite", "is", null)
      .order("fecha_limite", { ascending: true })

    if (data) {
      setTareas(data)
    }
  }

  // AGRUPAR POR FECHA

  const tareasAgrupadas = tareas.reduce((acc, tarea) => {

    const fecha = tarea.fecha_limite

    if (!acc[fecha]) {
      acc[fecha] = []
    }

    acc[fecha].push(tarea)

    return acc

  }, {} as Record<string, any[]>)

  return (
    <div>

      <h1 className="text-4xl font-bold mb-2">
        Calendario
      </h1>

      <p className="text-zinc-400 mb-10">
        Cronograma operativo de tareas
      </p>

      <div className="space-y-8">

        {Object.entries(tareasAgrupadas).map(([fecha, tareas]) => (

          <div
            key={fecha}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
          >

            <h2 className="text-2xl font-bold mb-6">
              📅 {fecha}
            </h2>

            <div className="space-y-4">

              {tareas.map((tarea: any) => (

                <div
                  key={tarea.id}
                  className={`
                    border rounded-xl p-4 flex items-center justify-between

                    ${tarea.estado === "completada"
                      ? "border-green-500/30 bg-green-500/10"

                      : tarea.prioridad === "alta"
                      ? "border-red-500/30 bg-red-500/10"

                      : tarea.prioridad === "media"
                      ? "border-yellow-500/30 bg-yellow-500/10"

                      : "border-blue-500/30 bg-blue-500/10"
                    }
                  `}
                >

                  <div>

                    <h3 className="font-semibold text-lg">
                      {tarea.titulo}
                    </h3>

                    <p className="text-zinc-400 text-sm">
                      {tarea.empresas?.nombre}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="capitalize">
                      {tarea.prioridad}
                    </p>

                    <p className="text-sm text-zinc-400">
                      {tarea.estado}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}