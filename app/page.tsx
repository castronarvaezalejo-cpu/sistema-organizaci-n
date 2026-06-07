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
  const [pendientes, setPendientes] = useState(0)
  const [completadas, setCompletadas] = useState(0)
  const [vencidas, setVencidas] = useState(0)

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
  total_facturado,
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

      const resultado = Object.entries(
        agrupadas
      ).map(([nombre, horas]) => ({
        nombre,
        horas,
      }))

      setHorasPorColaborador(resultado)

      setHorasMes(totalHoras)

// FACTURACIÓN REAL

const totalFacturacion =
  actividadesData.reduce(
    (acc: number, actividad: any) =>
      acc +
      Number(
        actividad.total_facturado || 0
      ),
    0
  )

setValorFacturable(
  totalFacturacion
)

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
    <div className="max-w-[820px]">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="
          text-2xl
          font-black
          tracking-tight
          mb-2
        ">
          Dashboard
        </h1>

        <p className="
          text-zinc-400
          text-base
        ">
          Resumen operativo y financiero
        </p>

      </div>

      {/* CARDS PRINCIPALES */}

      <div className="
        grid
        grid-cols-1
        lg:grid-cols-4
        gap-2
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

      {/* CARDS SECUNDARIAS */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-3
        mt-5
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
        mt-6
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900/40
        backdrop-blur-xl
        p-4
        shadow-2xl
      ">

        <h2 className="
          text-xl
          font-bold
          mb-5
        ">
          Productividad
        </h2>

        <div className="h-[160px]">

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
                fontSize={12}
              />

              <YAxis
                stroke="#a1a1aa"
                fontSize={12}
              />

              <Tooltip />

              <Bar
                dataKey="horas"
                radius={[8, 8, 0, 0]}
                fill="#3b82f6"
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
      border: "border-red-500/20",
      bg: "bg-red-500/10",
      text: "text-red-400",
    },

    yellow: {
      border: "border-yellow-500/20",
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
    },

    blue: {
      border: "border-blue-500/20",
      bg: "bg-blue-500/10",
      text: "text-blue-400",
    },

    green: {
      border: "border-green-500/20",
      bg: "bg-green-500/10",
      text: "text-green-400",
    },
  }

  return (
    <div
      className={`
        rounded-2xl
        min-h-[140px]
        border
        ${styles[color].border}
        bg-zinc-900/40
        backdrop-blur-xl
        p-3
        shadow-xl
        hover:translate-y-[-2px]
        transition-all
      `}
    >

      <div className="
        flex
        items-center
        justify-between
        mb-5
      ">

        <div className={`
          w-8
          h-8
          rounded-xl
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
        text-base
        font-semibold
        mb-2
      ">
        {title}
      </h3>

      <p className={`
        text-3xl
        font-black
        mb-2
        ${styles[color].text}
      `}>
        {value}
      </p>

      <p className="
        text-zinc-500
        text-xs
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
    yellow: "text-yellow-400 bg-yellow-500/10",
    green: "text-green-400 bg-green-500/10",
    blue: "text-blue-400 bg-blue-500/10",
  }

  return (
    <div className="
      rounded-2xl
      border
      border-zinc-800
      bg-zinc-900/40
      backdrop-blur-xl
      p-5
      shadow-xl
    ">

      <div className="
        flex
        items-center
        justify-between
        mb-5
      ">

        <h3 className="
          text-base
          font-semibold
        ">
          {title}
        </h3>

        <div className={`
          w-11
          h-11
          rounded-xl
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