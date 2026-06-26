"use client"

import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ShieldAlert,
} from "lucide-react"

import {
  useEffect,
  useState,
} from "react"

import { supabase }
from "@/lib/supabase"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function EmpresasPage() {

  const [
    open,
    setOpen,
  ] = useState(false)

  const [
    modoEdicion,
    setModoEdicion,
  ] = useState(false)

  const [
    empresaEditandoId,
    setEmpresaEditandoId,
  ] = useState("")

  const [
    nombre,
    setNombre,
  ] = useState("")

  const [
    contacto,
    setContacto,
  ] = useState("")

  const [
    telefono,
    setTelefono,
  ] = useState("")

  const [
  nit,
  setNit,
] = useState("")

  const [
    tarifaHora,
    setTarifaHora,
  ] = useState("")

  const [
    horasContratadas,
    setHorasContratadas,
  ] = useState("")

  const [
    permiteAcumulado,
    setPermiteAcumulado,
  ] = useState(false)

  const [
    mostrarArchivadas,
    setMostrarArchivadas,
  ] = useState(false)

  const [
    empresas,
    setEmpresas,
  ] = useState<any[]>([])


  const [
    busqueda,
    setBusqueda,
  ] = useState("")

  const [
    esAdmin,
    setEsAdmin,
  ] = useState(false)

  // ===================================
  // VERIFICAR ROL
  // ===================================

  useEffect(() => {

    verificarRol()

  }, [])

  async function verificarRol() {

    const {
      data: { session },
    } = await supabase
      .auth
      .getSession()

    if (!session) return

    const { data } =
      await supabase
        .from("colaboradores")
        .select("rol")
        .eq(
          "email",
          session.user.email
        )
        .single()

    if (
      data?.rol === "admin"
    ) {

      setEsAdmin(true)
    }
  }

  // ===================================
  // OBTENER EMPRESAS
  // ===================================

  useEffect(() => {

    obtenerEmpresas()

    }, [mostrarArchivadas])



  

  async function obtenerEmpresas() {

    const {
      data,
      error,
    } = await supabase
      .from("empresas")
      .select("*")
      .eq(
        "activa",
        !mostrarArchivadas
      )
      .order("nombre", {
        ascending: true,
      })

    if (error) {

      console.error(error)

      return
    }

    setEmpresas(data || [])
  }

  // ===================================
  // CREAR
  // ===================================

  async function crearEmpresa() {

    if (!nombre) return

    const { error } =
      await supabase
        .from("empresas")
        .insert([

          {
            nombre,

            contacto,

            telefono,

            nit,

            tarifa_hora:
              Number(
                tarifaHora || 0
              ),

            horas_contratadas:
              Number(
                horasContratadas || 0
              ),

            permite_acumulado:
              permiteAcumulado,

            activa: true,

            
            


          },
        ])

    if (error) {

      console.error(error)

      alert(
        "Error creando empresa"
      )

      return
    }

    limpiarFormulario()

    obtenerEmpresas()

    setOpen(false)
  }

  // ===================================
  // ACTUALIZAR
  // ===================================

  async function actualizarEmpresa()
   {

    
    const { error } =
      await supabase
        .from("empresas")
        .update({

          nombre,

          contacto,

          telefono,

          nit,

          tarifa_hora:
            Number(
              tarifaHora || 0
            ),

          horas_contratadas:
            Number(
              horasContratadas || 0
            ),

          permite_acumulado:
            permiteAcumulado,
        })
        .eq(
          "id",
          empresaEditandoId
        )

    if (error) {

      console.error(error)

      alert(
        "Error actualizando"
      )

      return
    }

    await fetch(
  "/api/empresas/recalcular-facturacion",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      empresaId: empresaEditandoId,
    }),
  }
);

    limpiarFormulario()

    obtenerEmpresas()

    setOpen(false)
  }

  // ===================================
  // ARCHIVAR
  // ===================================

  async function eliminarEmpresa(
    id: string,
    activa: boolean
  ) {

    const confirmar =
      confirm(
        activa
          ? "¿Archivar empresa?"
          : "¿Restaurar empresa?"
      )

    if (!confirmar)
      return

    const { error } =
      await supabase
        .from("empresas")
        .update({
          activa: !activa,
        })
        .eq("id", id)

    if (error) {

      console.error(error)

      return
    }

    obtenerEmpresas()
  }

  // ===================================
  // EDITAR
  // ===================================

  function abrirEdicion(
    empresa: any
  ) {

    setModoEdicion(true)

    setEmpresaEditandoId(
      empresa.id
    )

    setNombre(
      empresa.nombre || ""
    )

    setContacto(
      empresa.contacto || ""
    )

    setTelefono(
      empresa.telefono || ""
    )

    setNit(
  empresa.nit || ""
)

    setTarifaHora(
      empresa.tarifa_hora
        ?.toString() || ""
    )

    setHorasContratadas(
      empresa.horas_contratadas
        ?.toString() || ""
    )

    setPermiteAcumulado(
      empresa.permite_acumulado || false
    )

    setOpen(true)
  }

  // ===================================
  // LIMPIAR
  // ===================================

  function limpiarFormulario() {

    setNombre("")
    setContacto("")
    setTelefono("")
    setNit("")
    setTarifaHora("")
    setHorasContratadas("")
    setPermiteAcumulado(false)

    setModoEdicion(false)

    setEmpresaEditandoId("")
  }

  // ===================================
  // BUSQUEDA
  // ===================================

  const empresasFiltradas =
    empresas.filter(
      (empresa) => {

        const texto =
          busqueda.toLowerCase()

        return (

          empresa.nombre
            ?.toLowerCase()
            .includes(texto)

          ||

          empresa.contacto
            ?.toLowerCase()
            .includes(texto)

          ||

          empresa.telefono
            ?.toLowerCase()
            .includes(texto)
        )
      }
    )

  return (

    <div>

      {/* HEADER */}

      <div className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-6
        mb-10
      ">

        <div>

          <h1 className="
            text-4xl
            font-bold
            mb-2
          ">

            Empresas

          </h1>

          <p className="
            text-zinc-400
          ">

            Gestión de empresas y clientes

          </p>

        </div>

        {esAdmin && (

          <button
            onClick={() => {

              limpiarFormulario()

              setOpen(true)

            }}
            className="
              flex
              items-center
              gap-2
              bg-white
              text-black
              px-5
              py-3
              rounded-xl
              font-medium
            "
          >

            <Plus size={18} />

            Nueva Empresa

          </button>

        )}

      </div>

      {/* BUSCADOR */}

      <div className="mb-6">

        <div className="
          relative
          max-w-md
        ">

          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-zinc-500
            "
          />

          <input
            value={busqueda}
            onChange={(e) =>
              setBusqueda(
                e.target.value
              )
            }
            placeholder="
              Buscar empresa...
            "
            className="
              w-full
              bg-zinc-900
              border
              border-zinc-800
              rounded-2xl
              pl-11
              pr-4
              py-3
              outline-none
            "
          />

        </div>

      </div>

      {/* TABLA */}

      <div className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-2xl
        overflow-hidden
      ">

        <table className="
          w-full
        ">

          <thead className="
            border-b
            border-zinc-800
            bg-zinc-950/40
          ">

            <tr>

              <th className="p-5 text-left text-zinc-400">
                Empresa
              </th>

              <th className="p-5 text-left text-zinc-400">
                Contacto
              </th>

              <th className="p-5 text-left text-zinc-400">
                Teléfono
              </th>

              <th className="p-5 text-left text-zinc-400">
                Tarifa
              </th>

              <th className="p-5 text-left text-zinc-400">
                Horas
              </th>

              <th className="p-5 text-left text-zinc-400">
                Acumulado
              </th>

              {esAdmin && (

                <th className="p-5 text-left text-zinc-400">
                  Acciones
                </th>

              )}

            </tr>

          </thead>

          <tbody>

            {empresasFiltradas.map(
              (empresa) => (

              <tr
                key={empresa.id}
                className="
                  border-b
                  border-zinc-800
                  hover:bg-zinc-800/30
                  transition
                "
              >

                <td className="
  p-5
  font-medium
">

  <button
    onClick={() =>
      window.location.href =
        `/empresas/${empresa.id}`
    }
    className="
      text-white
      hover:text-blue-400
      transition
      hover:underline
      text-left
    "
  >

    {empresa.nombre}

  </button>

</td>

                <td className="p-5">
                  {empresa.contacto || "-"}
                </td>

                <td className="p-5">
                  {empresa.telefono || "-"}
                </td>

                <td className="
                  p-5
                  text-green-400
                ">

                  $
                  {Number(
                    empresa.tarifa_hora || 0
                  ).toLocaleString()}

                </td>

                <td className="
                  p-5
                  text-blue-400
                ">

                  {
                    empresa.horas_contratadas || 0
                  }h

                </td>

                <td className="p-5">

                  {empresa.permite_acumulado
                    ? "Sí"
                    : "No"}

                </td>

                {esAdmin && (

                  <td className="p-5">

                    <div className="
                      flex
                      items-center
                      gap-2
                    ">

                      {/* EXTINTORES */}

                      <button
                        onClick={() =>
                          window.location.href =
                            `/extintores?empresa=${empresa.id}`
                        }
                        className="
                          p-2
                          rounded-lg
                          bg-orange-500/10
                          text-orange-400
                          hover:bg-orange-500/20
                          transition
                        "
                      >

                        <ShieldAlert size={16} />

                      </button>

                      {/* EDITAR */}

                      <button
                        onClick={() =>
                          abrirEdicion(
                            empresa
                          )
                        }
                        className="
                          p-2
                          rounded-lg
                          bg-blue-500/10
                          text-blue-400
                          hover:bg-blue-500/20
                          transition
                        "
                      >

                        <Pencil size={16} />

                      </button>

                      {/* ARCHIVAR */}

                      <button
                        onClick={() =>
                          eliminarEmpresa(
                            empresa.id,
                            empresa.activa
                          )
                        }
                        className="
                          p-2
                          rounded-lg
                          bg-red-500/10
                          text-red-400
                          hover:bg-red-500/20
                          transition
                        "
                      >

                        <Trash2 size={16} />

                      </button>

                    </div>

                  </td>

                )}

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

        <DialogContent className="
          bg-zinc-900
          border-zinc-800
          text-white
        ">

          <DialogHeader>

            <DialogTitle>

              {modoEdicion
                ? "Editar Empresa"
                : "Nueva Empresa"}

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
                bg-zinc-800
                border
                border-zinc-700
                rounded-xl
                px-4
                py-3
              "
            />

            <input
              value={contacto}
              onChange={(e) =>
                setContacto(
                  e.target.value
                )
              }
              placeholder="Contacto"
              className="
                w-full
                bg-zinc-800
                border
                border-zinc-700
                rounded-xl
                px-4
                py-3
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
                bg-zinc-800
                border
                border-zinc-700
                rounded-xl
                px-4
                py-3
              "
            />

            <input
  value={nit}
  onChange={(e) =>
    setNit(e.target.value)
  }
  placeholder="NIT"
  className="
    w-full
    bg-zinc-800
    border
    border-zinc-700
    rounded-xl
    px-4
    py-3
  "
/>

            <input
              type="number"
              value={tarifaHora}
              onChange={(e) =>
                setTarifaHora(
                  e.target.value
                )
              }
              placeholder="
                Tarifa por hora
              "
              className="
                w-full
                bg-zinc-800
                border
                border-zinc-700
                rounded-xl
                px-4
                py-3
              "
            />

            <input
              type="number"
              value={horasContratadas}
              onChange={(e) =>
                setHorasContratadas(
                  e.target.value
                )
              }
              placeholder="
                Horas contratadas
              "
              className="
                w-full
                bg-zinc-800
                border
                border-zinc-700
                rounded-xl
                px-4
                py-3
              "
            />

            <label className="
              flex
              items-center
              gap-3
              text-sm
              text-zinc-300
            ">

              <input
                type="checkbox"
                checked={
                  permiteAcumulado
                }
                onChange={(e) =>
                  setPermiteAcumulado(
                    e.target.checked
                  )
                }
              />

              Acumular horas sobrantes al siguiente mes

            </label>

            <div className="
              flex
              gap-3
            ">

              <button
                onClick={() => {

                  limpiarFormulario()

                  setOpen(false)

                }}
                className="
                  flex-1
                  bg-zinc-800
                  hover:bg-zinc-700
                  transition
                  py-3
                  rounded-xl
                  font-medium
                "
              >

                Cancelar

              </button>

              <button
                onClick={
                  modoEdicion
                    ? actualizarEmpresa
                    : crearEmpresa
                }
                className="
                  flex-1
                  bg-white
                  text-black
                  py-3
                  rounded-xl
                  font-medium
                "
              >

                {modoEdicion
                  ? "Actualizar Empresa"
                  : "Guardar Empresa"}

              </button>

            </div>

          </div>

        </DialogContent>

      </Dialog>

    </div>
  )
}