"use client"

import { useEffect, useState }
from "react"

import { Plus, Trash2 }
from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { supabase }
from "@/lib/supabase"

export default function ColaboradoresPage() {

  const [open, setOpen] =
    useState(false)

  const [nombre, setNombre] =
    useState("")

  const [cargo, setCargo] =
    useState("")

  const [telefono, setTelefono] =
    useState("")

  const [email, setEmail] =
    useState("")

  const [rol, setRol] =
    useState("asesor")

  const [
    colaboradores,
    setColaboradores,
  ] = useState<any[]>([])

  const [
    esAdmin,
    setEsAdmin,
  ] = useState(false)

  // ===================================
  // VERIFICAR ROL
  // ===================================

  useEffect(() => {

    verificarRol()

    obtenerColaboradores()

  }, [])

  async function verificarRol() {

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) return

    const { data } = await supabase
      .from("colaboradores")
      .select("rol")
      .eq(
        "email",
        session.user.email
      )
      .single()

    if (data?.rol === "admin") {

      setEsAdmin(true)
    }
  }

  // ===================================
  // OBTENER
  // ===================================

  async function obtenerColaboradores() {

    const { data, error } =
      await supabase
        .from("colaboradores")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false,
          }
        )

    if (error) {

      console.error(error)

      return
    }

    setColaboradores(data || [])
  }

  // ===================================
  // CREAR
  // ===================================

  async function crearColaborador() {

    if (!nombre) return

    const { error } =
      await supabase
        .from("colaboradores")
        .insert([
          {
            nombre,
            cargo,
            telefono,
            email,
            rol,
          },
        ])

    if (error) {

      console.error(error)

      alert(
        "Error creando colaborador"
      )

      return
    }

    alert("Colaborador creado")

    setNombre("")
    setCargo("")
    setTelefono("")
    setEmail("")
    setRol("asesor")

    setOpen(false)

    obtenerColaboradores()
  }

  // ===================================
  // ELIMINAR
  // ===================================

  async function eliminarColaborador(
    id: string
  ) {

    const confirmar =
      confirm(
        "¿Eliminar colaborador?"
      )

    if (!confirmar) return

    const { error } =
      await supabase
        .from("colaboradores")
        .delete()
        .eq("id", id)

    if (error) {

      console.error(error)

      return
    }

    obtenerColaboradores()
  }

  return (

    <div>

      {/* HEADER */}

      <div className="
        flex
        items-center
        justify-between
        mb-10
      ">

        <div>

          <h1 className="
            text-4xl
            font-bold
            mb-2
          ">
            Colaboradores
          </h1>

          <p className="
            text-slate-500
          ">
            Gestión de personal operativo
          </p>

        </div>

        {/* SOLO ADMIN */}

        {esAdmin && (

          <button
            onClick={() =>
              setOpen(true)
            }
            className="
              flex
              items-center
              gap-2
              bg-[#0B4A92]
              text-white
              px-5
              py-3
              rounded-xl
              font-medium
              hover:opacity-90
              transition
            "
          >

            <Plus size={18} />

            Nuevo Colaborador

          </button>

        )}

      </div>

      {/* TABLA */}

      <div className="
        bg-white
        border
        border-slate-200
        rounded-2xl
        overflow-hidden
      ">

        <table className="w-full">

          <thead className="
            border-b
            border-slate-200
            bg-blue-50
          ">

            <tr className="text-left">

              <th className="
                p-5
                text-slate-500
                font-medium
              ">
                Nombre
              </th>

              <th className="
                p-5
                text-slate-500
                font-medium
              ">
                Cargo
              </th>

              <th className="
                p-5
                text-slate-500
                font-medium
              ">
                Email
              </th>

              <th className="
                p-5
                text-slate-500
                font-medium
              ">
                Rol
              </th>

              <th className="
                p-5
                text-slate-500
                font-medium
              ">
                Teléfono
              </th>

              {esAdmin && (

                <th className="
                  p-5
                  text-slate-500
                  font-medium
                ">
                  Acciones
                </th>

              )}

            </tr>

          </thead>

          <tbody>

            {colaboradores.map(
              (colaborador) => (

                <tr
                  key={colaborador.id}
                  className="
                    border-b
                    border-slate-200
                    hover:bg-white/40
                    transition
                  "
                >

                  <td className="
                    p-5
                    font-medium
                  ">
                    {colaborador.nombre}
                  </td>

                  <td className="p-5">
                    {
                      colaborador.cargo
                      || "-"
                    }
                  </td>

                  <td className="p-5">
                    {
                      colaborador.email
                      || "-"
                    }
                  </td>

                  <td className="p-5">

                    <span className={`
                      px-3
                      py-1
                      rounded-full
                      text-sm

                      ${
                        colaborador.rol === "admin"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-slate-100 text-slate-600"
                      }
                    `}>

                      {
                        colaborador.rol
                      }

                    </span>

                  </td>

                  <td className="p-5">
                    {
                      colaborador.telefono
                      || "-"
                    }
                  </td>

                  {esAdmin && (

                    <td className="p-5">

                      <button
                        onClick={() =>
                          eliminarColaborador(
                            colaborador.id
                          )
                        }
                        className="
                          bg-red-500/20
                          text-red-400
                          p-2
                          rounded-lg
                          hover:bg-red-500/30
                          transition
                        "
                      >

                        <Trash2 size={18} />

                      </button>

                    </td>

                  )}

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >

        <DialogContent className="
          bg-white
          border-slate-200
          text-slate-800
        ">

          <DialogHeader>

            <DialogTitle>
              Nuevo Colaborador
            </DialogTitle>

          </DialogHeader>

          <div className="
            space-y-4
            mt-4
          ">

            <input
              value={nombre}
              onChange={(e) =>
                setNombre(
                  e.target.value
                )
              }
              placeholder="Nombre"
              className="
                w-full
                bg-white
                border
                border-slate-200
                rounded-xl
                px-4
                py-3
                outline-none
              "
            />

            <input
              value={cargo}
              onChange={(e) =>
                setCargo(
                  e.target.value
                )
              }
              placeholder="Cargo"
              className="
                w-full
                bg-white
                border
                border-slate-200
                rounded-xl
                px-4
                py-3
                outline-none
              "
            />

            <input
              value={telefono}
              onChange={(e) =>
                setTelefono(
                  e.target.value
                )
              }
              placeholder="Teléfono"
              className="
                w-full
                bg-white
                border
                border-slate-200
                rounded-xl
                px-4
                py-3
                outline-none
              "
            />

            <input
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Correo login"
              className="
                w-full
                bg-white
                border
                border-slate-200
                rounded-xl
                px-4
                py-3
                outline-none
              "
            />

            <select
              value={rol}
              onChange={(e) =>
                setRol(
                  e.target.value
                )
              }
              className="
                w-full
                bg-white
                border
                border-slate-200
                rounded-xl
                px-4
                py-3
                outline-none
              "
            >

              <option value="asesor">
                Asesor
              </option>

              <option value="admin">
                Admin
              </option>

              <option value="trabajador">
                Trabajador
              </option>

            </select>

            <div className="
              flex
              gap-3
            ">

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="
                  flex-1
                  bg-white
                  text-slate-700
                  border
                  border-slate-200
                  py-3
                  rounded-xl
                  font-medium
                  hover:bg-slate-50
                  transition
                "
              >

                Cancelar

              </button>

              <button
                onClick={
                  crearColaborador
                }
                className="
                  flex-1
                  bg-[#0B4A92]
                  text-white
                  py-3
                  rounded-xl
                  font-medium
                  hover:bg-[#0B75C9]
                  transition
                "
              >

              Guardar Colaborador

              </button>

            </div>

          </div>

        </DialogContent>

      </Dialog>

    </div>
  )
}
