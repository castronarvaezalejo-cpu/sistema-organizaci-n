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

export default function TareasPage() {

  const [open, setOpen] = useState(false)

  const [titulo, setTitulo] = useState("")
  const [empresaId, setEmpresaId] = useState("")
  const [colaboradorId, setColaboradorId] = useState("")
  const [prioridad, setPrioridad] = useState("media")
  const [fechaLimite, setFechaLimite] = useState("")
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const [tareas, setTareas] = useState<any[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [colaboradores, setColaboradores] = useState<any[]>([])

  // FILTROS Y BUSCADOR

  const [filtro, setFiltro] = useState("todas")
  const [busqueda, setBusqueda] = useState("")

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
      .select(`
        *,
        empresas (
          nombre
        ),
        colaboradores (
          nombre
        )
      `)
      .order("created_at", { ascending: false })

    if (data) {
      setTareas(data)
    }
  }

  async function crearTarea() {

    if (!titulo || !empresaId) return

    let error

    if (editandoId) {

      const response = await supabase
        .from("tareas")
        .update({
          titulo,
          empresa_id: empresaId,
          colaborador_id: colaboradorId,
          prioridad,
          fecha_limite: fechaLimite,
        })
        .eq("id", editandoId)

      error = response.error

    } else {

      const response = await supabase
        .from("tareas")
        .insert([
          {
            titulo,
            empresa_id: empresaId,
            colaborador_id: colaboradorId,
            prioridad,
            fecha_limite: fechaLimite,
          },
        ])

      error = response.error
    }

    if (error) {
      console.error(error)
      alert(JSON.stringify(error))
      return
    }

    alert(editandoId ? "Tarea actualizada" : "Tarea creada")

    setTitulo("")
    setEmpresaId("")
    setColaboradorId("")
    setPrioridad("media")
    setFechaLimite("")

    setEditandoId(null)

    setOpen(false)

    obtenerTareas()
  }

  async function completarTarea(id: string) {

    const { error } = await supabase
      .from("tareas")
      .update({
        estado: "completada",
      })
      .eq("id", id)

    if (error) {
      console.error(error)
      return
    }

    obtenerTareas()
  }

  useEffect(() => {

    obtenerTareas()
    obtenerEmpresas()
    obtenerColaboradores()

  }, [])

  function editarTarea(tarea: any) {

    setTitulo(tarea.titulo)
    setEmpresaId(tarea.empresa_id)
    setColaboradorId(tarea.colaborador_id || "")
    setPrioridad(tarea.prioridad)
    setFechaLimite(tarea.fecha_limite || "")

    setEditandoId(tarea.id)

    setOpen(true)
  }

  async function eliminarTarea(id: string) {

    const confirmar = confirm(
      "¿Eliminar esta tarea?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("tareas")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
      return
    }

    obtenerTareas()
  }

  // FILTROS + BUSCADOR

  const tareasFiltradas = tareas.filter((tarea) => {

    const textoBusqueda = busqueda.toLowerCase()

    const coincideBusqueda =
      tarea.titulo.toLowerCase().includes(textoBusqueda) ||
      tarea.empresas?.nombre?.toLowerCase().includes(textoBusqueda) ||
      tarea.colaboradores?.nombre?.toLowerCase().includes(textoBusqueda)

    if (!coincideBusqueda) return false

    if (filtro === "pendientes") {
      return tarea.estado !== "completada"
    }

    if (filtro === "completadas") {
      return tarea.estado === "completada"
    }

    if (filtro === "vencidas") {

      if (!tarea.fecha_limite) return false

      return (
        new Date(tarea.fecha_limite) < new Date() &&
        tarea.estado !== "completada"
      )
    }

    return true
  })

  return (
    <div>

      {/* HEADER */}

      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-4xl font-bold mb-2">
            Tareas
          </h1>

          <p className="text-zinc-400">
            Gestión de tareas y pendientes
          </p>

          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar tarea, empresa o responsable..."
            className="w-full md:w-96 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none mt-6 mb-6"
          />

          <div className="flex gap-3 flex-wrap">

            <button
              onClick={() => setFiltro("todas")}
              className={`px-4 py-2 rounded-lg transition ${
                filtro === "todas"
                  ? "bg-white text-black"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              Todas
            </button>

            <button
              onClick={() => setFiltro("pendientes")}
              className={`px-4 py-2 rounded-lg transition ${
                filtro === "pendientes"
                  ? "bg-yellow-500 text-black"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              Pendientes
            </button>

            <button
              onClick={() => setFiltro("completadas")}
              className={`px-4 py-2 rounded-lg transition ${
                filtro === "completadas"
                  ? "bg-green-500 text-black"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              Completadas
            </button>

            <button
              onClick={() => setFiltro("vencidas")}
              className={`px-4 py-2 rounded-lg transition ${
                filtro === "vencidas"
                  ? "bg-red-500 text-white"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              Vencidas
            </button>

          </div>

        </div>

        <button
          onClick={() => {
            setEditandoId(null)
            setTitulo("")
            setEmpresaId("")
            setColaboradorId("")
            setPrioridad("media")
            setFechaLimite("")
            setOpen(true)
          }}
          className="flex items-center gap-2 bg-white text-black px-5 py-3 rounded-xl font-medium hover:opacity-90 transition"
        >

          <Plus size={18} />

          Nueva Tarea

        </button>

      </div>

      {/* TABLA */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

        <table className="w-full">

          <thead className="border-b border-zinc-800 bg-zinc-950/40">

            <tr className="text-left">

              <th className="p-5 text-zinc-400 font-medium">
                Tarea
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Empresa
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Responsable
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Prioridad
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Fecha
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Estado
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {tareasFiltradas.map((tarea) => (

              <tr
                key={tarea.id}
                className={`
                 border-b border-zinc-800 transition

                 ${tarea.estado === "completada"
                 ? "bg-green-500/5 hover:bg-green-500/10"

                 : !tarea.fecha_limite
                 ? "hover:bg-zinc-800/40"

                 : new Date(tarea.fecha_limite) < new Date()
                 ? "bg-red-500/10 hover:bg-red-500/20"

                 : new Date(tarea.fecha_limite).toDateString() === new Date().toDateString()
                  ? "bg-yellow-500/10 hover:bg-yellow-500/20"

                  : "bg-blue-500/5 hover:bg-blue-500/10"
               }
             `}
              >

                <td className="p-5 font-medium">
                  {tarea.titulo}
                </td>

                <td className="p-5">
                  {tarea.empresas?.nombre}
                </td>

                <td className="p-5">
                  {tarea.colaboradores?.nombre || "-"}
                </td>

                <td className="p-5">

                  <span className={`
                    px-3 py-1 rounded-full text-sm

                    ${tarea.prioridad === "alta"
                      ? "bg-red-500/20 text-red-400"
                      : tarea.prioridad === "media"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-blue-500/20 text-blue-400"
                    }
                  `}>

                    {tarea.prioridad}

                  </span>

                </td>

                <td className="p-5">
                  {tarea.fecha_limite || "-"}
                </td>

                <td className="p-5">

                  <span className={`
                    px-3 py-1 rounded-full text-sm

                    ${tarea.estado === "completada"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                    }
                  `}>

                    {tarea.estado}

                  </span>

                </td>

                <td className="p-5 flex flex-wrap gap-2">

                  {tarea.estado !== "completada" && (

                    <button
                      onClick={() => completarTarea(tarea.id)}
                      className="bg-green-500/20 text-green-400 px-3 py-2 rounded-lg text-sm hover:bg-green-500/30 transition"
                    >

                      Completar

                    </button>

                  )}

                  <button
                    onClick={() => editarTarea(tarea)}
                    className="bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg text-sm hover:bg-blue-500/30 transition"
                  >

                    Editar

                  </button>

                  <button
                    onClick={() => eliminarTarea(tarea.id)}
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
              {editandoId ? "Editar Tarea" : "Nueva Tarea"}
            </DialogTitle>

          </DialogHeader>

          <div className="space-y-4 mt-4">

            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título"
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
                Seleccionar responsable
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
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            >

              <option value="baja">
                Baja
              </option>

              <option value="media">
                Media
              </option>

              <option value="alta">
                Alta
              </option>

            </select>

            <input
              type="date"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            />

            <button
              onClick={crearTarea}
              className="w-full bg-white text-black py-3 rounded-xl font-medium"
            >

              {editandoId ? "Actualizar Tarea" : "Guardar Tarea"}

            </button>

          </div>

        </DialogContent>

      </Dialog>

    </div>
  )
}