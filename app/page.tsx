"use client"

import { useEffect, useState } from "react"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

import { supabase } from "@/lib/supabase"

export default function Home() {

  const [empresas, setEmpresas] = useState(0)
  const [pendientes, setPendientes] = useState(0)
  const [completadas, setCompletadas] = useState(0)
  const [vencidas, setVencidas] = useState(0)

  // PRODUCTIVIDAD

  const [horasPorColaborador, setHorasPorColaborador] =
    useState<any[]>([])

  const [horasMes, setHorasMes] = useState(0)

  const [valorFacturable, setValorFacturable] =
    useState(0)

  const [topColaborador, setTopColaborador] =
    useState("")

  useEffect(() => {
    cargarDashboard()
  }, [])

  async function cargarDashboard() {

    // EMPRESAS

    const { count: empresasCount } = await supabase
      .from("empresas")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("activa", true)

    setEmpresas(empresasCount || 0)

    // PENDIENTES

    const { count: pendientesCount } = await supabase
      .from("tareas")
      .select("*", {
        count: "exact",
        head: true,
      })
      .neq("estado", "completada")

    setPendientes(pendientesCount || 0)

    // COMPLETADAS

    const { count: completadasCount } = await supabase
      .from("tareas")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("estado", "completada")

    setCompletadas(completadasCount || 0)

    // VENCIDAS

    const hoy = new Date()
      .toISOString()
      .split("T")[0]

    const { count: vencidasCount } = await supabase
      .from("tareas")
      .select("*", {
        count: "exact",
        head: true,
      })
      .lt("fecha_limite", hoy)
      .neq("estado", "completada")

    setVencidas(vencidasCount || 0)

    // HORAS DEL MES

    const inicioMes = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
      .toISOString()
      .split("T")[0]

    const { data: actividadesData } = await supabase
      .from("actividades_realizadas")
      .select(`
        horas,
        colaboradores (
          nombre
        ),
        fecha
      `)
      .gte("fecha", inicioMes)

    if (actividadesData) {

      const agrupadas: Record<string, number> = {}

      let totalHoras = 0

      actividadesData.forEach((actividad: any) => {

        const nombre =
          actividad.colaboradores?.nombre ||
          "Sin nombre"

        const horas = Number(
          actividad.horas
        )

        agrupadas[nombre] =
          (agrupadas[nombre] || 0) +
          horas

        totalHoras += horas
      })

      // HORAS POR COLABORADOR

      const resultado = Object.entries(
        agrupadas
      ).map(([nombre, horas]) => ({
        nombre,
        horas,
      }))

      setHorasPorColaborador(resultado)

      // TOTAL HORAS MES

      setHorasMes(totalHoras)

      // FACTURACIÓN ESTIMADA

      const valorHora = 80000

      setValorFacturable(
        totalHoras * valorHora
      )

      // TOP COLABORADOR

      const top = [...resultado].sort(
        (a, b) => b.horas - a.horas
      )[0]

      if (top) {

        setTopColaborador(
          `${top.nombre} (${top.horas}h)`
        )
      }
    }
  }

  return (
    <div>

      <h1 className="text-4xl font-bold mb-2">
        Dashboard
      </h1>

      <p className="text-zinc-400 mb-10">
        Resumen operativo y financiero
      </p>

      {/* CARDS PRINCIPALES */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <Card
          title="Urgente"
          value={`${vencidas} tareas vencidas`}
          color="red"
        />

        <Card
          title="Pendientes"
          value={`${pendientes} tareas pendientes`}
          color="yellow"
        />

        <Card
          title="Empresas"
          value={`${empresas} empresas activas`}
          color="blue"
        />

        <Card
          title="Completadas"
          value={`${completadas} tareas completadas`}
          color="green"
        />

      </div>

      {/* FINANCIERO */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">

        <Card
          title="Horas del Mes"
          value={`${horasMes}h`}
          color="blue"
        />

        <Card
          title="Facturación Estimada"
          value={`$${valorFacturable.toLocaleString()}`}
          color="green"
        />

        <Card
          title="Top Colaborador"
          value={topColaborador || "-"}
          color="yellow"
        />

      </div>

      {/* GRAFICA */}

      <div className="mt-12">

        <h2 className="text-2xl font-bold mb-6">
          Productividad por colaborador
        </h2>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <div className="h-[400px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={horasPorColaborador}
              >

                <XAxis dataKey="nombre" />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="horas"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </div>
  )
}

function Card({
  title,
  value,
  color,
}: {
  title: string
  value: string
  color: "red" | "yellow" | "blue" | "green"
}) {

  const styles = {
    red:
      "border-red-500 bg-red-500/10 text-red-400",

    yellow:
      "border-yellow-500 bg-yellow-500/10 text-yellow-400",

    blue:
      "border-blue-500 bg-blue-500/10 text-blue-400",

    green:
      "border-green-500 bg-green-500/10 text-green-400",
  }

  return (
    <div
      className={`
        border rounded-2xl p-6
        hover:scale-[1.02]
        transition
        ${styles[color]}
      `}
    >

      <h3 className="text-xl font-semibold mb-3">
        {title}
      </h3>

      <p className="text-zinc-200 text-lg">
        {value}
      </p>

    </div>
  )
}