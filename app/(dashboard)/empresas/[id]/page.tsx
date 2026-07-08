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
    horasMes,
    setHorasMes,
  ] = useState(0)

  const [
    facturacion,
    setFacturacion,
  ] = useState(0)

useEffect(() => {

  if (empresaId) {

    cargarEmpresa()

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
        gap-4
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


      <SectionCard title="👥 Contactos">

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5">

    {/* Representante */}

    <div className="
      rounded-xl
      border
      border-slate-200
      p-4
      bg-white
    ">

      <h3 className="font-semibold text-slate-800 mb-3">
        👤 Representante Legal
      </h3>

      <p className="text-slate-700">
        {empresa?.representante_nombre || "-"}
      </p>

      <p className="text-slate-500 mt-2">
        📞 {empresa?.representante_telefono || "-"}
      </p>

    </div>

    {/* Administrador */}

    <div className="
      rounded-xl
      border
      border-slate-200
      p-4
      bg-white
    ">

      <h3 className="font-semibold text-slate-800 mb-3">
        👨‍💼 Administrador
      </h3>

      <p className="text-slate-700">
        {empresa?.administrador_nombre || "-"}
      </p>

      <p className="text-slate-500 mt-2">
        📞 {empresa?.administrador_telefono || "-"}
      </p>

    </div>

    {/* SST */}

    <div className="
      rounded-xl
      border
      border-slate-200
      p-4
      bg-white
    ">

      <h3 className="font-semibold text-slate-800 mb-3">
        🦺 Responsable SST
      </h3>

      <p className="text-slate-700">
        {empresa?.sst_nombre || "-"}
      </p>

      <p className="text-slate-500 mt-2">
        📞 {empresa?.sst_telefono || "-"}
      </p>

    </div>

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

                <td className="p-5">
                  {
                    actividad.descripcion
                  }
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

    </div>

  )

}

function SectionCard({
  title,
  children,
}: {
  title: string
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