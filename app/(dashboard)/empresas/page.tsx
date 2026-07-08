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

import PageHeader from "@/components/ui/PageHeader";

import Link from "next/link";

import {
  UserCheck,
  Building2,
  Shield,
} from "lucide-react";

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

  const [representanteNombre, setRepresentanteNombre] = useState("")
const [representanteTelefono, setRepresentanteTelefono] = useState("")

const [administradorNombre, setAdministradorNombre] = useState("")
const [administradorTelefono, setAdministradorTelefono] = useState("")

const [sstNombre, setSstNombre] = useState("")
const [sstTelefono, setSstTelefono] = useState("")

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


            representante_nombre: representanteNombre,
representante_telefono: representanteTelefono,

administrador_nombre: administradorNombre,
administrador_telefono: administradorTelefono,

sst_nombre: sstNombre,
sst_telefono: sstTelefono,
            
            


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


            representante_nombre: representanteNombre,
representante_telefono: representanteTelefono,

administrador_nombre: administradorNombre,
administrador_telefono: administradorTelefono,

sst_nombre: sstNombre,
sst_telefono: sstTelefono,


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

    setRepresentanteNombre(
  empresa.representante_nombre || ""
)

setRepresentanteTelefono(
  empresa.representante_telefono || ""
)

setAdministradorNombre(
  empresa.administrador_nombre || ""
)

setAdministradorTelefono(
  empresa.administrador_telefono || ""
)

setSstNombre(
  empresa.sst_nombre || ""
)

setSstTelefono(
  empresa.sst_telefono || ""
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

    setRepresentanteNombre("")
setRepresentanteTelefono("")

setAdministradorNombre("")
setAdministradorTelefono("")

setSstNombre("")
setSstTelefono("")

  
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

<PageHeader
  title="Empresas"
  description="Gestión de empresas y clientes"
action={
  esAdmin && (
    <button
      onClick={() => {
        limpiarFormulario();
        setOpen(true);
      }}
      className="
        flex
        items-center
        gap-2
        px-5
        py-3
        rounded-xl
        bg-[#0B4A92]
        hover:bg-[#0B75C9]
        text-white
        font-semibold
        transition
        shadow-sm
      "
    >
      <Plus size={20} />
      Nueva Empresa
    </button>
  )
}
/>

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
              text-slate-400
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
  bg-white
  border
  border-slate-200
  rounded-xl
  pl-11
  pr-4
  py-3
  outline-none
  text-slate-800
  placeholder:text-slate-400
  shadow-sm
  focus:border-blue-500
  focus:ring-4
  focus:ring-blue-100
  transition
"
          />

        </div>

      </div>

      {/* TABLA */}

<div
className="
bg-white
border
border-slate-200
rounded-2xl
overflow-hidden
shadow-sm
"
>

        <table className="
          w-full
        ">

<thead
className="
bg-blue-50
border-b
border-slate-200
"
>

            <tr>

              <th className="p-5 text-left text-slate-700
font-semibold">
                Empresa
              </th>

              <th className="p-5 text-left text-slate-700
font-semibold">
                Contacto
              </th>

              <th className="p-5 text-left text-slate-700
font-semibold">
                Teléfono
              </th>

              <th className="p-5 text-left text-slate-700
font-semibold">
                Tarifa
              </th>

              <th className="p-5 text-left text-slate-700
font-semibold">
                Horas
              </th>

              <th className="p-5 text-lefttext-slate-700
font-semibold">
                Acumulado
              </th>

              {esAdmin && (

                <th className="p-5 text-left text-slate-700
font-semibold">
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
border-slate-200
hover:bg-blue-50
transition-colors
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
text-slate-800
hover:text-blue-700
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

                <td className="p-5">

<span
className="
inline-flex
items-center
rounded-full
bg-green-100
text-green-700
px-3
py-1
text-sm
font-semibold
"
>
$
{Number(
empresa.tarifa_hora || 0
).toLocaleString("es-CO")}
</span>

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

<DialogContent
  className="
    bg-white
    border-slate-200
    text-slate-800
    max-h-[90vh]
    overflow-y-auto
    max-w-2xl
  "
>

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
                bg-white
                border
                border-slate-200
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
                bg-white
                border
                border-slate-200
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
                bg-white
                border
                border-slate-200
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
    bg-white
    border
    border-slate-200
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
                bg-white
                border
                border-slate-200
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
                bg-white
                border
                border-slate-200
                rounded-xl
                px-4
                py-3
              "
            />

<div className="pt-4 border-t border-slate-200">
  <h3 className="text-lg font-semibold text-slate-800">
    Contactos adicionales
  </h3>

  <p className="text-sm text-slate-500 mt-1">
    Responsables específicos de la empresa.
  </p>
</div>

<div
  className="
    mt-4
    rounded-xl
    border
    border-slate-200
    p-4
    space-y-3
  "
>

<div className="flex items-center gap-3">

  <div
    className="
      w-10
      h-10
      rounded-lg
      bg-blue-50
      flex
      items-center
      justify-center
    "
  >

    <UserCheck
      size={20}
      className="text-blue-600"
    />

  </div>

  <p className="font-semibold text-slate-800">
    Representante Legal
  </p>

</div>

  <input
    value={representanteNombre}
    onChange={(e) =>
      setRepresentanteNombre(e.target.value)
    }
    placeholder="Nombre del representante"
    className="
      w-full
      bg-white
      border
      border-slate-200
      rounded-xl
      px-4
      py-3
    "
  />

  <input
    value={representanteTelefono}
    onChange={(e) =>
      setRepresentanteTelefono(e.target.value)
    }
    placeholder="Teléfono del representante"
    className="
      w-full
      bg-white
      border
      border-slate-200
      rounded-xl
      px-4
      py-3
    "
  />

</div>


<div
  className="
    mt-4
    rounded-xl
    border
    border-slate-200
    p-4
    space-y-3
  "
>


    <div className="flex items-center gap-3">

  <div
    className="
      w-10
      h-10
      rounded-lg
      bg-emerald-50
      flex
      items-center
      justify-center
    "
  >

    <Building2
      size={20}
      className="text-emerald-600"
    />

  </div>

  <p className="font-semibold text-slate-800">
    Administrador
  </p>

</div>
  

  <input
    value={administradorNombre}
    onChange={(e) =>
      setAdministradorNombre(e.target.value)
    }
    placeholder="Nombre del administrador"
    className="
      w-full
      bg-white
      border
      border-slate-200
      rounded-xl
      px-4
      py-3
    "
  />

  <input
    value={administradorTelefono}
    onChange={(e) =>
      setAdministradorTelefono(e.target.value)
    }
    placeholder="Teléfono del administrador"
    className="
      w-full
      bg-white
      border
      border-slate-200
      rounded-xl
      px-4
      py-3
    "
  />

</div>


<div
  className="
    mt-4
    rounded-xl
    border
    border-slate-200
    p-4
    space-y-3
  "
>

 
    <div className="flex items-center gap-3">

  <div
    className="
      w-10
      h-10
      rounded-lg
      bg-amber-50
      flex
      items-center
      justify-center
    "
  >

    <Shield
      size={20}
      className="text-amber-500"
    />

  </div>

  <p className="font-semibold text-slate-800">
    Responsable SST
  </p>

</div>
  

  <input
    value={sstNombre}
    onChange={(e) =>
      setSstNombre(e.target.value)
    }
    placeholder="Nombre del responsable SST"
    className="
      w-full
      bg-white
      border
      border-slate-200
      rounded-xl
      px-4
      py-3
    "
  />

  <input
    value={sstTelefono}
    onChange={(e) =>
      setSstTelefono(e.target.value)
    }
    placeholder="Teléfono del responsable SST"
    className="
      w-full
      bg-white
      border
      border-slate-200
      rounded-xl
      px-4
      py-3
    "
  />

</div>

            <label className="
              flex
              items-center
              gap-3
              text-sm
              text-slate-600
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
                  bg-white
                  hover:bg-slate-100
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
                  bg-[#0B4A92]
                  text-white
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
