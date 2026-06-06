"use client"

import {
  Plus,
  Pencil,
  Trash2,
} from "lucide-react"

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

  const [modoEdicion, setModoEdicion] =
    useState(false)

  const [empresaEditandoId, setEmpresaEditandoId] =
    useState("")

  const [nombre, setNombre] = useState("")
  const [contacto, setContacto] = useState("")
  const [telefono, setTelefono] = useState("")

  const [mostrarArchivadas, setMostrarArchivadas] =
    useState(false)

  const [empresas, setEmpresas] = useState<any[]>([])

  // CREAR EMPRESA

  async function crearEmpresa() {

    if (!nombre) return

    const { error } = await supabase
      .from("empresas")
      .insert([
        {
          nombre,
          contacto,
          telefono,
          activa: true,
        },
      ])

    if (error) {

      console.error(error)

      alert(JSON.stringify(error))

      return
    }

    alert("Empresa creada")

    limpiarFormulario()

    obtenerEmpresas()

    setOpen(false)
  }

  // ACTUALIZAR EMPRESA

  async function actualizarEmpresa() {

    const { error } = await supabase
      .from("empresas")
      .update({
        nombre,
        contacto,
        telefono,
      })
      .eq("id", empresaEditandoId)

    if (error) {

      console.error(error)

      return
    }

    alert("Empresa actualizada")

    limpiarFormulario()

    obtenerEmpresas()

    setOpen(false)
  }

  // ARCHIVAR / RESTAURAR

  async function eliminarEmpresa(
    id: string,
    activa: boolean
  ) {

    const mensaje = activa
      ? "¿Archivar esta empresa?"
      : "¿Restaurar esta empresa?"

    const confirmar = confirm(mensaje)

    if (!confirmar) return

    const { error } = await supabase
      .from("empresas")
      .update({
        activa: !activa,
      })
      .eq("id", id)

    if (error) {

      console.error(error)

      alert("Error actualizando empresa")

      return
    }

    obtenerEmpresas()
  }

  // OBTENER EMPRESAS

  async function obtenerEmpresas() {

    const { data, error } = await supabase
      .from("empresas")
      .select("*")
      .eq(
        "activa",
        !mostrarArchivadas
      )
      .order("created_at", {
        ascending: false,
      })

    if (error) {

      console.error(error)

      return
    }

    setEmpresas(data || [])
  }

  // ABRIR EDICION

  function abrirEdicion(empresa: any) {

    setModoEdicion(true)

    setEmpresaEditandoId(empresa.id)

    setNombre(empresa.nombre || "")
    setContacto(empresa.contacto || "")
    setTelefono(empresa.telefono || "")

    setOpen(true)
  }

  // LIMPIAR

  function limpiarFormulario() {

    setNombre("")
    setContacto("")
    setTelefono("")

    setModoEdicion(false)

    setEmpresaEditandoId("")
  }

  // REFRESCAR

  useEffect(() => {

    obtenerEmpresas()

  }, [mostrarArchivadas])

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
          onClick={() => {

            limpiarFormulario()

            setOpen(true)
          }}
          className="flex items-center gap-2 bg-white text-black px-5 py-3 rounded-xl font-medium hover:opacity-90 transition"
        >

          <Plus size={18} />

          Nueva Empresa

        </button>

      </div>

      {/* FILTROS */}

      <div className="flex items-center gap-4 mb-6">

        <button
          onClick={() =>
            setMostrarArchivadas(false)
          }
          className={`
            px-4 py-2 rounded-xl transition

            ${!mostrarArchivadas
              ? "bg-white text-black"
              : "bg-zinc-900 text-zinc-400"
            }
          `}
        >

          Activas

        </button>

        <button
          onClick={() =>
            setMostrarArchivadas(true)
          }
          className={`
            px-4 py-2 rounded-xl transition

            ${mostrarArchivadas
              ? "bg-white text-black"
              : "bg-zinc-900 text-zinc-400"
            }
          `}
        >

          Archivadas

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

              <th className="p-5 text-zinc-400 font-medium">
                Acciones
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

                  <span
                    className={`
                      px-3 py-1 rounded-full text-sm

                      ${empresa.activa
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                      }
                    `}
                  >

                    {empresa.activa
                      ? "Activa"
                      : "Archivada"
                    }

                  </span>

                </td>

                <td className="p-5">
                  0
                </td>

                {/* ACCIONES */}

                <td className="p-5">

                  <div className="flex items-center gap-3">

                    {/* EDITAR */}

                    <button
                      onClick={() =>
                        abrirEdicion(empresa)
                      }
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                    >

                      <Pencil size={18} />

                    </button>

                    {/* ARCHIVAR / RESTAURAR */}

                    <button
                      onClick={() =>
                        eliminarEmpresa(
                          empresa.id,
                          empresa.activa
                        )
                      }
                      className={`
                        p-2 rounded-lg transition

                        ${mostrarArchivadas
                          ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        }
                      `}
                    >

                      {mostrarArchivadas
                        ? "↩"
                        : <Trash2 size={18} />
                      }

                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >

        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">

          <DialogHeader>

            <DialogTitle>

              {modoEdicion
                ? "Editar Empresa"
                : "Nueva Empresa"
              }

            </DialogTitle>

          </DialogHeader>

          <div className="space-y-4 mt-4">

            <input
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              placeholder="Nombre de la empresa"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            />

            <input
              value={contacto}
              onChange={(e) =>
                setContacto(e.target.value)
              }
              placeholder="Contacto"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            />

            <input
              value={telefono}
              onChange={(e) =>
                setTelefono(e.target.value)
              }
              placeholder="Teléfono"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none"
            />

            <button
              onClick={
                modoEdicion
                  ? actualizarEmpresa
                  : crearEmpresa
              }
              className="w-full bg-white text-black py-3 rounded-xl font-medium"
            >

              {modoEdicion
                ? "Actualizar Empresa"
                : "Guardar Empresa"
              }

            </button>

          </div>

        </DialogContent>

      </Dialog>

    </div>
  )
}