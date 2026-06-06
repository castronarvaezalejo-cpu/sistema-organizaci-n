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

export default function ColaboradoresPage() {

  const [open, setOpen] = useState(false)

  const [nombre, setNombre] = useState("")
  const [cargo, setCargo] = useState("")
  const [telefono, setTelefono] = useState("")

  const [colaboradores, setColaboradores] = useState<any[]>([])

  async function obtenerColaboradores() {

    const { data, error } = await supabase
      .from("colaboradores")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setColaboradores(data)
  }

  async function crearColaborador() {

    if (!nombre) return

    const { error } = await supabase
      .from("colaboradores")
      .insert([
        {
          nombre,
          cargo,
          telefono,
        },
      ])

    if (error) {
      console.error(error)
      alert("Error creando colaborador")
      return
    }

    alert("Colaborador creado")

    setNombre("")
    setCargo("")
    setTelefono("")

    setOpen(false)

    obtenerColaboradores()
  }

  async function eliminarColaborador(id: string) {

    const confirmar = confirm(
      "¿Eliminar colaborador?"
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("colaboradores")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
      return
    }

    obtenerColaboradores()
  }

  useEffect(() => {
    obtenerColaboradores()
  }, [])

  return (
    <div>

      {/* HEADER */}

      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-4xl font-bold mb-2">
            Colaboradores
          </h1>

          <p className="text-zinc-400">
            Gestión de personal operativo
          </p>

        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-white text-black px-5 py-3 rounded-xl font-medium hover:opacity-90 transition"
        >

          <Plus size={18} />

          Nuevo Colaborador

        </button>

      </div>

      {/* TABLA */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

        <table className="w-full">

          <thead className="border-b border-zinc-800 bg-zinc-950/40">

            <tr className="text-left">

              <th className="p-5 text-zinc-400 font-medium">
                Nombre
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Cargo
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Teléfono
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {colaboradores.map((colaborador) => (

              <tr
                key={colaborador.id}
                className="border-b border-zinc-800 hover:bg-zinc-800/40 transition"
              >

                <td className="p-5 font-medium">
                  {colaborador.nombre}
                </td>

                <td className="p-5">
                  {colaborador.cargo || "-"}
                </td>

                <td className="p-5">
                  {colaborador.telefono || "-"}
                </td>

                <td className="p-5">

                  <button
                    onClick={() => eliminarColaborador(colaborador.id)}
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
              Nuevo Colaborador
            </DialogTitle>

          </DialogHeader>

          <div className="space-y-4 mt-4">

            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            />

            <input
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Cargo"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            />

            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Teléfono"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            />

            <button
              onClick={crearColaborador}
              className="w-full bg-white text-black py-3 rounded-xl font-medium"
            >

              Guardar Colaborador

            </button>

          </div>

        </DialogContent>

      </Dialog>

    </div>
  )
}