"use client"

import { useSearchParams } from "next/navigation";

import {
  useEffect,
  useState,
} from "react"

import {
  useParams,
} from "next/navigation"

import {
  supabase,
} from "@/lib/supabase"


import {
  UserCheck,
  Building2,
  Shield,
  Phone,
  Users,
  UserPlus,
  User,
  Briefcase,
  CalendarDays,
  Mail,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import TrabajadorDialog from "@/components/ui/trabajadores/TrabajadorDialog"

import TrabajadorCard from "@/components/ui/trabajadores/TrabajadorCard"

import { Search } from "lucide-react"

export default function EmpresaDetallePage() {

  const params =
    useParams()

  const empresaId =
    params.id as string 

    const searchParams =
  useSearchParams()

const tab =
  searchParams.get("tab")

  const [
    empresa,
    setEmpresa,
  ] = useState<any>(null)

  const [
    actividades,
    setActividades,
  ] = useState<any[]>([])

  const [
    tareas,
    setTareas,
  ] = useState<any[]>([])

  const [
    capacitaciones,
    setCapacitaciones,
  ] = useState<any[]>([])

  const [
    extintores,
    setExtintores,
  ] = useState<any[]>([])

  const [
  trabajadores,
  setTrabajadores,
] = useState<any[]>([])

const [
  busquedaTrabajador,
  setBusquedaTrabajador,
] = useState("")

const [
  filtroEstado,
  setFiltroEstado,
] = useState("Todos")


  const [
    horasMes,
    setHorasMes,
  ] = useState(0)

  const [
    facturacion,
    setFacturacion,
  ] = useState(0)


  const [
  descripcionSeleccionada,
  setDescripcionSeleccionada,
] = useState("")

const [
  openDescripcion,
  setOpenDescripcion,
] = useState(false)

const [
  openTrabajador,
  setOpenTrabajador,
] = useState(false)

const [
  trabajadorSeleccionado,
  setTrabajadorSeleccionado,
] = useState<any>(null)






const trabajadoresFiltrados =
  trabajadores.filter((trabajador) => {

    const coincideNombre =
      trabajador.nombre
        ?.toLowerCase()
        .includes(
          busquedaTrabajador.toLowerCase()
        )

    const coincideEstado =
      filtroEstado === "Todos"
        ?   true
        : trabajador.estado === filtroEstado

    return (
      coincideNombre &&
      coincideEstado
    )

  })



useEffect(() => {

if (empresaId) {

  cargarEmpresa()

  cargarTrabajadores()

}

  // SCROLL A EXTINTORES

  if (tab === "extintores") {

    setTimeout(() => {

      const seccion =
        document.getElementById(
          "extintores"
        )

      if (seccion) {

        seccion.scrollIntoView({
          behavior: "smooth",
        })

      }

    }, 500)

  }
  

}, [empresaId, tab])




  async function cargarEmpresa() {

    // EMPRESA

    const {
      data: empresaData,
    } = await supabase
      .from("empresas")
      .select("*")
      .eq("id", empresaId)
      .single()

    if (empresaData) {

      setEmpresa(
        empresaData
      )

    }

    // ACTIVIDADES

    const inicioMes =
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      )
      .toISOString()
      .split("T")[0]

    const {
      data: actividadesData,
    } = await supabase
      .from(
        "actividades_realizadas"
      )
      .select(`
        *,
        colaboradores (
          nombre
        )
      `)
      .eq(
        "empresa_id",
        empresaId
      )
      .gte(
        "fecha",
        inicioMes
      )
      .order(
        "fecha",
        {
          ascending: false,
        }
      )

    if (actividadesData) {

      setActividades(
        actividadesData
      )

      const totalHoras =
        actividadesData.reduce(
          (
            acc: number,
            item: any
          ) =>
            acc +
            Number(
              item.horas || 0
            ),
          0
        )

      setHorasMes(
        totalHoras
      )

      const totalFacturacion =
        actividadesData.reduce(
          (
            acc: number,
            item: any
          ) =>
            acc +
            Number(
              item.total_facturado || 0
            ),
          0
        )

      setFacturacion(
        totalFacturacion
      )
    }

    // TAREAS

    const {
      data: tareasData,
    } = await supabase
      .from("tareas")
      .select(`
        *,
        colaboradores (
          nombre
        )
      `)
      .eq(
        "empresa_id",
        empresaId
      )
      .eq(
        "archivada",
        false
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )

    if (tareasData) {

      setTareas(
        tareasData
      )

    }

    // CAPACITACIONES

    const {
      data: capacitacionesData,
    } = await supabase
      .from("capacitaciones")
      .select(`
        *,
        colaboradores (
          nombre
        )
      `)
      .eq(
        "empresa_id",
        empresaId
      )
      .order(
        "fecha",
        {
          ascending: false,
        }
      )

    if (capacitacionesData) {

      setCapacitaciones(
        capacitacionesData
      )

    }

    // EXTINTORES

    const {
      data: extintoresData,
    } = await supabase
      .from("extintores")
      .select("*")
      .eq(
        "empresa_id",
        empresaId
      )
      .order(
        "fecha_recarga",
        {
          ascending: true,
        }
      )

    if (extintoresData) {

      setExtintores(
        extintoresData
      )

    }

  }

  async function cargarTrabajadores() {

  const { data, error } = await supabase
    .from("trabajadores_empresa")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("nombre")

  if (error) {

    console.error(error)

    return

  }

  setTrabajadores(data || [])

}

async function eliminarTrabajador(id: string) {

  const confirmar = confirm(
    "¿Deseas eliminar este trabajador?"
  )

  if (!confirmar) return

  const { error } = await supabase
    .from("trabajadores_empresa")
    .delete()
    .eq("id", id)

  if (error) {

    console.error(error)

    alert("No fue posible eliminar el trabajador.")

    return

  }

  cargarTrabajadores()

}

  const horasLimite =
    empresa?.horas_contratadas || 0

  const horasRestantes =
    horasLimite - horasMes

  return (

    <div>

      {/* HEADER */}

      <div className="
        mb-10
      ">

<h1 className="
  text-4xl
  font-black
  mb-3
">
  {empresa?.nombre}
</h1>

<div className="space-y-1 mb-4">

  {empresa?.nit && (
    <p className="text-slate-600">
      <span className="font-semibold text-slate-800">
        NIT:
      </span>{" "}
      {empresa.nit}
    </p>
  )}

  {empresa?.contacto && (
    <p className="text-slate-600">
      <span className="font-semibold text-slate-800">
        Contacto:
      </span>{" "}
      {empresa.contacto}
    </p>
  )}

  {empresa?.telefono && (
    <p className="text-slate-600">
      <span className="font-semibold text-slate-800">
        Teléfono:
      </span>{" "}
      {empresa.telefono}
    </p>
  )}

</div>

<p className="
  text-slate-500
  text-lg
">
  Panel empresarial
</p>

      </div>

      {/* CARDS */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-6
        mb-8
      ">

        {/* HORAS */}

        <div className="
          rounded-2xl
          border
          border-slate-200
          bg-white/40
          p-5
        ">

          <p className="
            text-slate-500
            mb-3
          ">

            Horas consumidas

          </p>

          <h2 className="
            text-4xl
            font-black
            text-blue-400
          ">

            {horasMes}h

          </h2>

          <div className="
            mt-5
          ">

            <div className="
              w-full
              h-4
              bg-white
              rounded-full
              overflow-hidden
            ">

              <div
                className={`
                  h-full
                  transition-all

                  ${
                    horasMes >= horasLimite
                      ? "bg-red-500"

                      : horasMes >=
                        horasLimite * 0.8
                      ? "bg-yellow-500"

                      : "bg-green-500"
                  }
                `}
                style={{
                  width: `${
                    horasLimite > 0

                      ? Math.min(
                          (horasMes /
                            horasLimite) *
                            100,
                          100
                        )

                      : 0
                  }%`,
                }}
              />

            </div>

            <p className="
              text-sm
              text-slate-500
              mt-2
            ">

              {horasMes}h de{" "}
              {horasLimite}h usadas

            </p>

          </div>

        </div>

        {/* RESTANTES */}

        <div className={`
          rounded-2xl
          border
          p-5

          ${
            horasRestantes < 0
              ? "border-red-500/30 bg-red-500/10"
              : "border-slate-200 bg-white/40"
          }
        `}>

          <p className="
            text-slate-500
            mb-3
          ">

            Horas restantes

          </p>

          <h2 className={`
            text-4xl
            font-black

            ${
              horasRestantes < 0
                ? "text-red-400"
                : "text-green-400"
            }
          `}>

            {horasRestantes}h

          </h2>

        </div>

        {/* FACTURACIÓN */}

        <div className="
          rounded-2xl
          border
          border-slate-200
          bg-white/40
          p-5
        ">

          <p className="
            text-slate-500
            mb-3
          ">

            Facturación

          </p>

          <h2 className="
            text-4xl
            font-black
            text-green-400
          ">

            $
            {facturacion.toLocaleString()}

          </h2>

        </div>

      </div>


     <SectionCard
  title={
    <div className="flex items-center gap-3">
      <Users
        size={24}
        className="text-blue-600"
      />

      <span>
        Contactos
      </span>
    </div>
  }
>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5">

    {/* Representante */}

    <div className="
      rounded-xl
      border
      border-slate-200
      p-6
      bg-white
      hover:shadow-md
transition
    ">

<div className="flex items-center gap-3 mb-4">

  <div
    className="
      w-11
      h-11
      rounded-xl
      bg-blue-50
      flex
      items-center
      justify-center
    "
  >

    <UserCheck
      size={22}
      className="text-blue-600"
    />

  </div>

  <h3 className="font-semibold text-slate-800">
    Representante Legal
  </h3>

</div>

      <p className="text-slate-700">
        {empresa?.representante_nombre || "-"}
      </p>

<div className="flex items-center gap-2 mt-3">

  <Phone
    size={16}
    className="text-slate-400"
  />

  <span className="text-slate-500">
    {empresa?.representante_telefono || "-"}
  </span>

</div>

    </div>

    {/* Administrador */}

<div
  className="
    rounded-xl
    border
    border-slate-200
    p-6
    bg-white
    hover:shadow-md
    transition
  "
>

  <div className="flex items-center gap-3 mb-4">

    <div
      className="
        w-11
        h-11
        rounded-xl
        bg-emerald-50
        flex
        items-center
        justify-center
      "
    >

      <Building2
        size={22}
        className="text-emerald-600"
      />

    </div>

    <h3 className="font-semibold text-slate-800">
      Administrador
    </h3>

  </div>

  <p className="text-slate-700">
    {empresa?.administrador_nombre || "-"}
  </p>

  <div className="flex items-center gap-2 mt-3">

    <Phone
      size={16}
      className="text-slate-400"
    />

    <span className="text-slate-500">
      {empresa?.administrador_telefono || "-"}
    </span>

  </div>

</div>
    {/* SST */}

<div
  className="
    rounded-xl
    border
    border-slate-200
    p-6
    bg-white
    hover:shadow-md
    transition
  "
>

  <div className="flex items-center gap-3 mb-4">

    <div
      className="
        w-11
        h-11
        rounded-xl
        bg-amber-50
        flex
        items-center
        justify-center
      "
    >

      <Shield
        size={22}
        className="text-amber-500"
      />

    </div>

    <h3 className="font-semibold text-slate-800">
      Responsable SST
    </h3>

  </div>

  <p className="text-slate-700">
    {empresa?.sst_nombre || "-"}
  </p>

  <div className="flex items-center gap-2 mt-3">

    <Phone
      size={16}
      className="text-slate-400"
    />

    <span className="text-slate-500">
      {empresa?.sst_telefono || "-"}
    </span>

  </div>

</div>

  </div>

</SectionCard>

<SectionCard
  title={
    <div className="flex items-center justify-between w-full">

      <div className="flex items-center gap-3">

        <UserPlus
          size={24}
          className="text-blue-600"
        />

        <span>
          Trabajadores
        </span>

      </div>



    </div>
  }
>

 <div
  className="
    p-6
  "
>



<div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

  <div className="relative w-full md:w-96">

  <Search
    size={22}
    className="
      absolute
      left-4
      top-1/2
      -translate-y-1/2
      text-slate-400
    "
  />

  <input
    value={busquedaTrabajador}
    onChange={(e) =>
      setBusquedaTrabajador(e.target.value)
    }
    placeholder="Buscar por nombre..."
    className="
      w-full
      rounded-2xl
      border
      border-slate-200
      bg-white
      py-3
      pl-14
      pr-4
      text-slate-700
      placeholder:text-slate-400
      focus:border-[#0B4A92]
      focus:outline-none
      transition
    "
  />

  </div>

  <select
  value={filtroEstado}
  onChange={(e) =>
    setFiltroEstado(e.target.value)
  }
  className="
    rounded-xl
    border
    border-slate-200
    bg-white
    px-4
    py-3
    text-slate-700
    outline-none
    focus:border-[#0B4A92]
  "
>

  <option value="Todos">
    Todos
  </option>

  <option value="Activo">
    Activo
  </option>

  <option value="Inactivo">
    Inactivo
  </option>

</select>



  <button
    onClick={() => {
      setTrabajadorSeleccionado(null)
      setOpenTrabajador(true)
    }}
    className="
      bg-[#0B4A92]
      hover:bg-[#0D5DB8]
      text-white
      px-6
      py-3
      rounded-xl
      font-medium
      transition
    "
  >
    + Nuevo trabajador
  </button>

</div>

  {trabajadoresFiltrados.length === 0 ? (

    <>

      <div
        className="
          w-20
          h-20
          rounded-2xl
          bg-blue-50
          flex
          items-center
          justify-center
          mb-5
        "
      >

        <UserPlus
          size={42}
          className="text-blue-600"
        />

      </div>

      <h3 className="text-xl font-semibold text-slate-800">
        No hay trabajadores registrados
      </h3>

      <p className="mt-3 max-w-xl text-slate-500">
        Registra los trabajadores de esta empresa para gestionar
        cumpleaños, aniversarios laborales y futuras funcionalidades
        del sistema.
      </p>

    </>

  ) : (

    <div className="w-full grid md:grid-cols-2 xl:grid-cols-3 gap-5">

{trabajadoresFiltrados.map((trabajador) => (

  <TrabajadorCard
    key={trabajador.id}
    trabajador={trabajador}
    onEdit={() => {

      setTrabajadorSeleccionado(trabajador)

      setOpenTrabajador(true)

    }}
    onDelete={() =>
      eliminarTrabajador(trabajador.id)
    }
  />

))}

    </div>

  )}



</div>

</SectionCard>

      {/* ACTIVIDADES */}

      <SectionCard title="Actividades">

        <table className="w-full">

          <thead className="
            bg-blue-50
          ">

            <tr>

              <th className="p-5 text-left">
                Fecha
              </th>

              <th className="p-5 text-left">
                Colaborador
              </th>

              <th className="p-5 text-left">
                Horas
              </th>

              <th className="p-5 text-left">
                Descripción
              </th>

            </tr>

          </thead>

          <tbody>

            {actividades.map(
              (actividad) => (

              <tr
                key={actividad.id}
                className="
                  border-b
                  border-slate-200
                "
              >

                <td className="p-5">
                  {actividad.fecha}
                </td>

                <td className="p-5">
                  {
                    actividad
                    .colaboradores
                    ?.nombre
                  }
                </td>

                <td className="
                  p-5
                  text-blue-400
                  font-bold
                ">
                  {actividad.horas}h
                </td>

                <td className="p-5 max-w-sm">

  <p className="truncate">
    {actividad.descripcion}
  </p>

  <button
    onClick={() => {

      setDescripcionSeleccionada(
        actividad.descripcion
      )

      setOpenDescripcion(true)

    }}
    className="
      mt-2
      text-sm
      text-blue-600
      hover:text-blue-700
      font-medium
    "
  >
    Ver más
  </button>

</td>
              </tr>

            ))}

          </tbody>

        </table>

      </SectionCard>

      {/* TAREAS */}

      <SectionCard title="Tareas">

        <table className="w-full">

          <thead className="
            bg-blue-50
          ">

            <tr>

              <th className="p-5 text-left">
                Tarea
              </th>

              <th className="p-5 text-left">
                Responsable
              </th>

              <th className="p-5 text-left">
                Estado
              </th>

              <th className="p-5 text-left">
                Prioridad
              </th>

            </tr>

          </thead>

          <tbody>

            {tareas.map(
              (tarea) => (

              <tr
                key={tarea.id}
                className="
                  border-b
                  border-slate-200
                "
              >

                <td className="p-5">
                  {tarea.titulo}
                </td>

                <td className="p-5">
                  {
                    tarea
                    .colaboradores
                    ?.nombre
                  }
                </td>

                <td className="p-5">
                  {tarea.estado}
                </td>

                <td className="p-5">
                  {tarea.prioridad}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </SectionCard>

      {/* CAPACITACIONES */}

      <SectionCard title="Capacitaciones">

        <table className="w-full">

          <thead className="
            bg-blue-50
          ">

            <tr>

              <th className="p-5 text-left">
                Fecha
              </th>

              <th className="p-5 text-left">
                Tipo
              </th>

              <th className="p-5 text-left">
                Responsable
              </th>

              <th className="p-5 text-left">
                Estado
              </th>

            </tr>

          </thead>

          <tbody>

            {capacitaciones.map(
              (capacitacion) => (

              <tr
                key={capacitacion.id}
                className="
                  border-b
                  border-slate-200
                "
              >

                <td className="p-5">
                  {capacitacion.fecha}
                </td>

                <td className="p-5">
                  {capacitacion.tipo}
                </td>

                <td className="p-5">

                  {
                    capacitacion
                    .colaboradores
                    ?.nombre || "-"
                  }

                </td>

                <td className="p-5">

                  <span className={`
                    px-3
                    py-1
                    rounded-full
                    text-sm

                    ${
                      capacitacion.estado
                      === "realizada"

                      ? `
                        bg-green-500/20
                        text-green-400
                      `

                      : `
                        bg-yellow-500/20
                        text-yellow-400
                      `
                    }
                  `}>

                    {
                      capacitacion.estado
                    }

                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </SectionCard>
      

      <div id="extintores">

  {/* EXTINTORES */}

  <SectionCard title="🧯 Extintores">

        <table className="w-full">

          <thead className="
            bg-blue-50
          ">

            <tr>

              <th className="p-5 text-left">
                Código
              </th>

              <th className="p-5 text-left">
                Tipo
              </th>

              <th className="p-5 text-left">
                Capacidad
              </th>

              <th className="p-5 text-left">
                Ubicación
              </th>

              <th className="p-5 text-left">
                Recarga
              </th>

            </tr>

          </thead>

          <tbody>

            {extintores.map(
              (extintor) => (

              <tr
                key={extintor.id}
                className="
                  border-b
                  border-slate-200
                "
              >

                <td className="p-5">
                  {extintor.codigo}
                </td>

                <td className="p-5">
                  {extintor.tipo}
                </td>

                <td className="p-5">
                  {extintor.capacidad}
                </td>

                <td className="p-5">
                  {extintor.ubicacion}
                </td>

                <td className="p-5">
                  {
                    extintor.fecha_recarga
                  }
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {extintores.length === 0 && (

          <div className="
            p-8
            text-center
            text-slate-500
          ">

            No hay extintores registrados

          </div>

        )}

            </SectionCard>

      </div> 


      <Dialog
        open={openDescripcion}
        onOpenChange={setOpenDescripcion}
      >

        <DialogContent className="max-w-2xl bg-white">

          <DialogHeader>

            <DialogTitle>
              📄 Descripción de la actividad
            </DialogTitle>

          </DialogHeader>

          <div
            className="
              whitespace-pre-wrap
              leading-7
              text-slate-700
              mt-4
            "
          >

            {descripcionSeleccionada}

          </div>

          <div className="mt-6 flex justify-end">

  <button
    onClick={() =>
      setOpenDescripcion(false)
    }
    className="
      bg-[#0B4A92]
      hover:bg-[#0D5DB8]
      text-white
      px-5
      py-2
      rounded-xl
      transition
    "
  >
    Cerrar
  </button>

</div>

        </DialogContent>

      </Dialog>

<TrabajadorDialog
  key={
    `${trabajadorSeleccionado?.id ?? "nuevo"}-${openTrabajador}`
  }
  open={openTrabajador}
  onOpenChange={(open) => {

    setOpenTrabajador(open)

    if (!open) {

      setTrabajadorSeleccionado(null)

    }

  }}
  empresaId={empresaId}
  onCreated={cargarTrabajadores}
  trabajador={trabajadorSeleccionado}
/>Fconst [estado, setEstado] = useState("Activo")


    </div> 



  )

}

function SectionCard({
  title,
  children,
}: {
  title: React.ReactNode
  children: React.ReactNode
}) {

  return (

    <div className="
      rounded-2xl
      border
      border-slate-200
      bg-white/40
      overflow-hidden
      mb-8
    ">

      <div className="
        p-5
        border-b
        border-slate-200
      ">

        <h2 className="
          text-2xl
          font-bold
        ">

          {title}

        </h2>



      </div>

      {children}



    </div>

  )

}