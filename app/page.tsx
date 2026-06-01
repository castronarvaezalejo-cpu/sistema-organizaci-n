"use client"

import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabase"

export default function Home() {
  const [empresas, setEmpresas] = useState(0)
  const [pendientes, setPendientes] = useState(0)
  const [completadas, setCompletadas] = useState(0)
  const [vencidas, setVencidas] = useState(0)
  async function cargarDashboard() {

  // EMPRESAS

  const { count: empresasCount } = await supabase
    .from("empresas")
    .select("*", { count: "exact", head: true })

  setEmpresas(empresasCount || 0)

  // PENDIENTES

  const { count: pendientesCount } = await supabase
    .from("tareas")
    .select("*", { count: "exact", head: true })
    .neq("estado", "completada")

  setPendientes(pendientesCount || 0)

  // COMPLETADAS

  const { count: completadasCount } = await supabase
    .from("tareas")
    .select("*", { count: "exact", head: true })
    .eq("estado", "completada")

  setCompletadas(completadasCount || 0)

  // VENCIDAS

  const hoy = new Date().toISOString().split("T")[0]

  const { count: vencidasCount } = await supabase
    .from("tareas")
    .select("*", { count: "exact", head: true })
    .lt("fecha_limite", hoy)
    .neq("estado", "completada")

  setVencidas(vencidasCount || 0)
}

useEffect(() => {
  cargarDashboard()
}, [])
  return (
    <div>

      <h1 className="text-4xl font-bold mb-2">
        Dashboard
      </h1>

      <p className="text-zinc-400 mb-10">
        Resumen operativo del día
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Card
          title="Urgente"
          value={`${vencidas} tareas vencidas`}
          color="red"
        />

        <Card
          title="Hoy"
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
         color="blue"
        />

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
  color: "red" | "yellow" | "blue"
}) {

  const styles = {
    red: "border-red-500 bg-red-500/10 text-red-400",
    yellow: "border-yellow-500 bg-yellow-500/10 text-yellow-400",
    blue: "border-blue-500 bg-blue-500/10 text-blue-400",
  }

  return (
    <div className={`border rounded-2xl p-6 ${styles[color]}`}>
      <h3 className="text-xl font-semibold mb-3">
        {title}
      </h3>

      <p className="text-zinc-200">
        {value}
      </p>
    </div>
  )
}