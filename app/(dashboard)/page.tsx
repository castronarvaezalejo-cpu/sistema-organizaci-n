"use client"

import { useEffect, useState } from "react"

import {
  AlertTriangle,
  Clock3,
  Building2,
  CheckCircle2,
  DollarSign,
  Trophy,
} from "lucide-react"

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

  const [pendientes, setPendientes] =
    useState(0)

  const [completadas, setCompletadas] =
    useState(0)

  const [vencidas, setVencidas] =
    useState(0)

  const [
    horasPorColaborador,
    setHorasPorColaborador,
  ] = useState<any[]>([])

  const [horasMes, setHorasMes] =
    useState(0)

  const [
    valorFacturable,
    setValorFacturable,
  ] = useState(0)

  const [topColaborador, setTopColaborador] =
    useState("")

  useEffect(() => {

    cargarDashboard()

  }, [])

  async function cargarDashboard() {

    // EMPRESAS

    const { count: empresasCount } =
      await supabase
        .from("empresas")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("activa", true)

    setEmpresas(empresasCount || 0)

    // PENDIENTES

    const { count: pendientesCount } =
      await supabase
        .from("tareas")
        .select("*", {
          count: "exact",
          head: true,
        })
        .neq("estado", "completada")

    setPendientes(pendientesCount || 0)

    // COMPLETADAS

    const { count: completadasCount } =
      await supabase
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

    const { count: vencidasCount } =
      await supabase
        .from("tareas")
        .select("*", {
          count: "exact",
          head: true,
        })
        .lt("fecha_limite", hoy)
        .neq("estado", "completada")

    setVencidas(vencidasCount || 0)

    // ACTIVIDADES

    const inicioMes = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
      .toISOString()
      .split("T")[0]

    const { data: actividadesData } =
      await supabase
        .from("actividades_realizadas")
        .select(`
          horas,
          total_facturado,
          colaboradores (
            nombre
          ),
          fecha
        `)
        .gte("fecha", inicioMes)

    if (actividadesData) {

      const agrupadas:
        Record<string, number> = {}

      let totalHoras = 0

      actividadesData.forEach(
        (actividad: any) => {

          const nombre =
            actividad.colaboradores?.nombre ||
            "Sin nombre"

          const horas = Number(
            actividad.horas
          )

          agrupadas[nombre] =
            (agrupadas[nombre] || 0)
            + horas

          totalHoras += horas
        }
      )

      const resultado =
        Object.entries(agrupadas)
          .map(([nombre, horas]) => ({
            nombre,
            horas,
          }))

      setHorasPorColaborador(resultado)

      setHorasMes(totalHoras)

      const totalFacturacion =
        actividadesData.reduce(
          (
            acc: number,
            actividad: any
          ) =>
            acc +
            Number(
              actividad.total_facturado || 0
            ),
          0
        )

      setValorFacturable(
        totalFacturacion
      )

      const top = [...resultado]
        .sort(
          (a, b) =>
            b.horas - a.horas
        )[0]

      if (top) {

        setTopColaborador(
          `${top.nombre} (${top.horas}h)`
        )
      }
    }
  }

  return (

    <div className="max-w-[1200px]">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="
          text-5xl
          font-black
          tracking-tight
          mb-2
        ">

          Dashboard

        </h1>

        <p className="
          text-zinc-400
          text-lg
        ">

          Resumen operativo y financiero

        </p>

      </div>

      {/* CARDS */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-4
      ">

        <PremiumCard
          title="Urgente"
          value={vencidas}
          subtitle="tareas vencidas"
          color="red"
          icon={<AlertTriangle size={22} />}
        />

        <PremiumCard
          title="Pendientes"
          value={pendientes}
          subtitle="tareas pendientes"
          color="yellow"
          icon={<Clock3 size={22} />}
        />

        <PremiumCard
          title="Empresas"
          value={empresas}
          subtitle="empresas activas"
          color="blue"
          icon={<Building2 size={22} />}
        />

        <PremiumCard
          title="Completadas"
          value={completadas}
          subtitle="tareas completadas"
          color="green"
          icon={<CheckCircle2 size={22} />}
        />

      </div>

      {/* MINI CARDS */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-4
        mt-6
      ">

        <PremiumMiniCard
          title="Horas del Mes"
          value={`${horasMes}h`}
          color="blue"
          icon={<Clock3 size={20} />}
        />

        <PremiumMiniCard
          title="Facturación"
          value={`$${valorFacturable.toLocaleString()}`}
          color="green"
          icon={<DollarSign size={20} />}
        />

        <PremiumMiniCard
          title="Top"
          value={topColaborador || "-"}
          color="yellow"
          icon={<Trophy size={20} />}
        />

      </div>

      {/* GRAFICA */}

      <div className="
        mt-8
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900/40
        p-6
      ">

        <h2 className="
          text-2xl
          font-bold
          mb-6
        ">

          Productividad

        </h2>

        <div className="h-[300px]">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart
              data={horasPorColaborador}
            >

              <XAxis
                dataKey="nombre"
                stroke="#a1a1aa"
              />

              <YAxis
                stroke="#a1a1aa"
              />

              <Tooltip />

              <Bar
                dataKey="horas"
                fill="#3b82f6"
                radius={[10, 10, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  )
}

function PremiumCard({
  title,
  value,
  subtitle,
  color,
  icon,
}: {
  title: string
  value: number
  subtitle: string
  color: "red" | "yellow" | "blue" | "green"
  icon: React.ReactNode
}) {

  const styles = {

    red: {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/20",
    },

    yellow: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      border: "border-yellow-500/20",
    },

    blue: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
    },

    green: {
      bg: "bg-green-500/10",
      text: "text-green-400",
      border: "border-green-500/20",
    },
  }

  return (

    <div className={`
      rounded-3xl
      border
      ${styles[color].border}
      bg-zinc-900/40
      p-5
    `}>

      <div className="
        flex
        items-center
        justify-between
        mb-6
      ">

        <div className={`
          w-12
          h-12
          rounded-2xl
          flex
          items-center
          justify-center
          ${styles[color].bg}
          ${styles[color].text}
        `}>

          {icon}

        </div>

      </div>

      <h3 className="
        text-lg
        font-semibold
        mb-2
      ">

        {title}

      </h3>

      <p className={`
        text-4xl
        font-black
        mb-2
        ${styles[color].text}
      `}>

        {value}

      </p>

      <p className="
        text-zinc-500
      ">

        {subtitle}

      </p>

    </div>
  )
}

function PremiumMiniCard({
  title,
  value,
  color,
  icon,
}: {
  title: string
  value: string
  color: "yellow" | "green" | "blue"
  icon: React.ReactNode
}) {

  const styles = {

    yellow:
      "text-yellow-400 bg-yellow-500/10",

    green:
      "text-green-400 bg-green-500/10",

    blue:
      "text-blue-400 bg-blue-500/10",
  }

  return (

    <div className="
      rounded-3xl
      border
      border-zinc-800
      bg-zinc-900/40
      p-5
    ">

      <div className="
        flex
        items-center
        justify-between
        mb-6
      ">

        <h3 className="
          text-lg
          font-semibold
        ">

          {title}

        </h3>

        <div className={`
          w-12
          h-12
          rounded-2xl
          flex
          items-center
          justify-center
          ${styles[color]}
        `}>

          {icon}

        </div>

      </div>

<p className={`
  text-3xl
  font-black

  ${color === "green"
    ? "text-green-400"

    : color === "yellow"
    ? "text-yellow-400"

    : "text-blue-400"
  }
`}>
  {value}
</p>

    </div>
  )
}