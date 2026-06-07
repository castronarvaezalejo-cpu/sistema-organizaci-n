"use client"

import { useEffect, useState } from "react"

import { Plus } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { supabase } from "@/lib/supabase"

export default function ActividadesPage() {

  const [open, setOpen] = useState(false)

  const [descripcion, setDescripcion] = useState("")
  const [horas, setHoras] = useState("")
  const [fecha, setFecha] = useState("")

  const [empresaId, setEmpresaId] = useState("")
  const [colaboradorId, setColaboradorId] = useState("")
  const [tareaId, setTareaId] = useState("")

  const [actividades, setActividades] = useState<any[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [tareas, setTareas] = useState<any[]>([])

  async function obtenerActividades() {

    const { data } = await supabase
      .from("actividades_realizadas")
      .select(`
        *,
        empresas (
          nombre
        ),
        colaboradores (
          nombre
        ),
        tareas (
          titulo
        )
      `)
      .order("fecha", { ascending: false })

    if (data) {
      setActividades(data)
    }
  }

  async function obtenerEmpresas() {

    const { data } = await supabase
      .from("empresas")
      .select("*")
      .order("nombre")

    if (data) {
      setEmpresas(data)
    }
  }

  async function obtenerColaboradores() {

    const { data } = await supabase
      .from("colaboradores")
      .select("*")
      .order("nombre")

    if (data) {
      setColaboradores(data)
    }
  }

  async function obtenerTareas() {

    const { data } = await supabase
      .from("tareas")
      .select("*")
      .order("titulo")

    if (data) {
      setTareas(data)
    }
  }

  async function crearActividad() {

    if (
      !descripcion ||
      !horas ||
      !empresaId ||
      !colaboradorId
    ) return

    // OBTENER TARIFA DE LA EMPRESA

    const { data: empresaData } = await supabase
      .from("empresas")
      .select("tarifa_hora")
      .eq("id", empresaId)
      .single()

    if (!empresaData) {

      alert("Empresa no encontrada")

      return
    }

    // CALCULAR FACTURACIÓN

    const tarifaHora =
      Number(empresaData.tarifa_hora || 0)

    const totalFacturado =
      Number(horas) * tarifaHora

    // GUARDAR ACTIVIDAD

    const { error } = await supabase
      .from("actividades_realizadas")
      .insert([
        {
          descripcion,
          horas: Number(horas),
          fecha,
          empresa_id: empresaId,
          colaborador_id: colaboradorId,
          tarea_id: tareaId || null,
          total_facturado: totalFacturado,
        },
      ])

    if (error) {

      console.error(error)

      alert("Error creando actividad")

      return
    }

    alert(
      `Actividad registrada\n\nFacturación: $${totalFacturado.toLocaleString()}`
    )

    // LIMPIAR

    setDescripcion("")
    setHoras("")
    setFecha("")
    setEmpresaId("")
    setColaboradorId("")
    setTareaId("")

    setOpen(false)

    obtenerActividades()
  }

  async function eliminarActividad(id: string) {

    const confirmar = confirm(
      "¿Eliminar actividad?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("actividades_realizadas")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
      return
    }

    obtenerActividades()
  }

  useEffect(() => {

    obtenerActividades()
    obtenerEmpresas()
    obtenerColaboradores()
    obtenerTareas()

  }, [])

  return (
    <div>

      {/* HEADER */}

      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-4xl font-bold mb-2">
            Actividades
          </h1>

          <p className="text-zinc-400">
            Registro operativo y control de horas
          </p>

        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-white text-black px-5 py-3 rounded-xl font-medium hover:opacity-90 transition"
        >

          <Plus size={18} />

          Nueva Actividad

        </button>

      </div>

      {/* TABLA */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

        <table className="w-full">

          <thead className="border-b border-zinc-800 bg-zinc-950/40">

            <tr className="text-left">

              <th className="p-5 text-zinc-400 font-medium">
                Fecha
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Colaborador
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Empresa
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Actividad
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Tarea
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Horas
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Facturación
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {actividades.map((actividad) => (

              <tr
                key={actividad.id}
                className="border-b border-zinc-800 hover:bg-zinc-800/40 transition"
              >

                <td className="p-5">
                  {actividad.fecha}
                </td>

                <td className="p-5 font-medium">
                  {actividad.colaboradores?.nombre}
                </td>

                <td className="p-5">
                  {actividad.empresas?.nombre}
                </td>

                <td className="p-5">
                  {actividad.descripcion}
                </td>

                <td className="p-5">
                  {actividad.tareas?.titulo || "-"}
                </td>

                <td className="p-5">
                  {actividad.horas}h
                </td>

                <td className="p-5 text-green-400 font-semibold">
                  $
                  {Number(
                    actividad.total_facturado || 0
                  ).toLocaleString()}
                </td>

                <td className="p-5">

                  <button
                    onClick={() => eliminarActividad(actividad.id)}
                    className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500/30 transition"
                  >

                    Eliminar

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      <Dialog open={open} onOpenChange={setOpen}>

        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">

          <DialogHeader>

            <DialogTitle>
              Nueva Actividad
            </DialogTitle>

          </DialogHeader>

          <div className="space-y-4 mt-4">

            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción de la actividad"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            />

            <input
              type="number"
              value={horas}
              onChange={(e) => setHoras(e.target.value)}
              placeholder="Horas trabajadas"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            />

            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            />

            <select
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            >

              <option value="">
                Seleccionar empresa
              </option>

              {empresas.map((empresa) => (

                <option
                  key={empresa.id}
                  value={empresa.id}
                >

                  {empresa.nombre}

                </option>

              ))}

            </select>

            <select
              value={colaboradorId}
              onChange={(e) => setColaboradorId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            >

              <option value="">
                Seleccionar colaborador
              </option>

              {colaboradores.map((colaborador) => (

                <option
                  key={colaborador.id}
                  value={colaborador.id}
                >

                  {colaborador.nombre}

                </option>

              ))}

            </select>

            <select
              value={tareaId}
              onChange={(e) => setTareaId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            >

              <option value="">
                Seleccionar tarea
              </option>

              {tareas.map((tarea) => (

                <option
                  key={tarea.id}
                  value={tarea.id}
                >

                  {tarea.titulo}

                </option>

              ))}

            </select>

            <button
              onClick={crearActividad}
              className="w-full bg-white text-black py-3 rounded-xl font-medium"
            >

              Guardar Actividad

            </button>

          </div>

        </DialogContent>

      </Dialog>

    </div>
  )
}