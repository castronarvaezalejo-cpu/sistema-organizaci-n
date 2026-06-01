"use client"

import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"



export default function EmpresasPage() {

  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState("")
  const [contacto, setContacto] = useState("")
  const [telefono, setTelefono] = useState("")
  const [empresas, setEmpresas] = useState<any[]>([])

  async function crearEmpresa() {

    if (!nombre) return

    const { error } = await supabase
      .from("empresas")
      .insert([
        {
          nombre,
          contacto,
          telefono,
        },
      ])

    if (error) {
      console.error(error)
      alert(JSON.stringify(error))
      return
    }

    alert("Empresa creada")

    obtenerEmpresas()

    setNombre("")
    setContacto("")
    setTelefono("")

    setOpen(false)
  }

  async function obtenerEmpresas() {

    const { data, error } = await supabase
      .from("empresas")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setEmpresas(data)
  }

  useEffect(() => {
    obtenerEmpresas()
  }, [])

  return (
    <div>

      {/* HEADER */}

      <div className="flex items-center justify-between mb-10">

        <div>
          <h1 className="text-4xl font-bold mb-2">
            Empresas
          </h1>

          <p className="text-zinc-400">
            Gestión de empresas y clientes
          </p>
        </div>

        <button
           onClick={() => setOpen(true)}
           className="flex items-center gap-2 bg-white text-black px-5 py-3 rounded-xl font-medium hover:opacity-90 transition"
>

          <Plus size={18} />

          Nueva Empresa
        </button>

      </div>

      {/* TABLA */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

        <table className="w-full">

          <thead className="border-b border-zinc-800 bg-zinc-950/40">

            <tr className="text-left">

              <th className="p-5 text-zinc-400 font-medium">
                Empresa
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Estado
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Tareas
              </th>

            </tr>

          </thead>

          <tbody>

            {empresas.map((empresa) => (
              <tr
                key={empresa.id}
                className="border-b border-zinc-800 hover:bg-zinc-800/40 transition"
              >

                <td className="p-5 font-medium">
                  {empresa.nombre}
                </td>

                <td className="p-5">

                  <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">

                     Activa

                  </span>


                </td>

                <td className="p-5">
                  0
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>
<Dialog open={open} onOpenChange={setOpen}>

  <DialogContent className="bg-zinc-900 border-zinc-800 text-white">

    <DialogHeader>

      <DialogTitle>
        Nueva Empresa
      </DialogTitle>

    </DialogHeader>

    <div className="space-y-4 mt-4">
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
       placeholder="Nombre de la empresa"
       className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"

      />

      <input
       value={contacto}
       onChange={(e) => setContacto(e.target.value)}
       placeholder="Contacto"
       className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"

      />

      <input
       value={telefono}
      onChange={(e) => setTelefono(e.target.value)}
      placeholder="Teléfono"
      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
      
      />
       
      <button
       onClick={crearEmpresa}
       className="w-full bg-white text-black py-3 rounded-xl font-medium"
    >
       Guardar Empresa
     </button>

    </div>

  </DialogContent>

</Dialog>
    </div>
  )
}