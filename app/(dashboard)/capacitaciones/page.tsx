"use client"

import { useEffect, useState }
from "react"

import {
  Plus,
  CalendarDays,
} from "lucide-react"

import { supabase }
from "@/lib/supabase"

export default function CapacitacionesPage() {

  const [
    empresas,
    setEmpresas,
  ] = useState<any[]>([])

  const [
    colaboradores,
    setColaboradores,
  ] = useState<any[]>([])

  const [
    capacitaciones,
    setCapacitaciones,
  ] = useState<any[]>([])

  const [
    empresaId,
    setEmpresaId,
  ] = useState("")

  const [
    responsableId,
    setResponsableId,
  ] = useState("")

  const [tipo, setTipo] =
    useState("")

  const [fecha, setFecha] =
    useState("")

  const [
    observaciones,
    setObservaciones,
  ] = useState("")

  useEffect(() => {

    cargarDatos()

  }, [])

  async function cargarDatos() {

    // EMPRESAS

    const {
      data: empresasData,
    } = await supabase
      .from("empresas")
      .select("*")
      .eq("activa", true)
      .order("nombre")

    if (empresasData) {

      setEmpresas(
        empresasData
      )
    }

    // COLABORADORES

    const {
      data: colaboradoresData,
    } = await supabase
      .from("colaboradores")
      .select("*")
      .eq("activo", true)
      .order("nombre")

    if (colaboradoresData) {

      setColaboradores(
        colaboradoresData
      )
    }

    obtenerCapacitaciones()
  }

  async function obtenerCapacitaciones() {

    const { data } =
      await supabase
        .from("capacitaciones")
        .select(`
          *,
          empresas (
            nombre
          ),
          colaboradores (
            nombre
          )
        `)
        .order("fecha", {
          ascending: true,
        })

    if (data) {

      setCapacitaciones(data)
    }
  }

  async function crearCapacitacion() {

    if (
      !empresaId ||
      !tipo ||
      !fecha
    ) {

      alert(
        "Completa los campos"
      )

      return
    }

    const { error } =
      await supabase
        .from("capacitaciones")
        .insert([

          {
            empresa_id:
              empresaId,

            responsable_id:
              responsableId || null,

            tipo,

            fecha,

            observaciones,

            estado:
              "programada",
          },
        ])

    if (error) {

      console.log(error)

      alert(
        "Error guardando"
      )

      return
    }

    alert(
      "Capacitación creada"
    )

    setEmpresaId("")
    setResponsableId("")
    setTipo("")
    setFecha("")
    setObservaciones("")

    obtenerCapacitaciones()
  }

  async function completarCapacitacion(
    id: string
  ) {

    await supabase
      .from("capacitaciones")
      .update({
        estado:
          "realizada",
      })
      .eq("id", id)

    obtenerCapacitaciones()
  }

  function estadoColor(
    estado: string
  ) {

    if (
      estado === "realizada"
    ) {

      return `
        bg-green-500/20
        text-green-400
      `
    }

    return `
      bg-yellow-500/20
      text-yellow-400
    `
  }

  return (

    <div>

      {/* HEADER */}

      <div className="
        mb-10
      ">

        <h1 className="
          text-5xl
          font-black
          mb-3
        ">

          Capacitaciones

        </h1>

        <p className="
          text-zinc-400
          text-lg
        ">

          Gestión de formación SST

        </p>

      </div>

      {/* FORM */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-4
        mb-8
      ">

        {/* EMPRESA */}

        <select
          value={empresaId}
          onChange={(e) =>
            setEmpresaId(
              e.target.value
            )
          }
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            px-4
            py-4
            outline-none
          "
        >

          <option value="">
            Empresa
          </option>

          {empresas.map(
            (empresa) => (

            <option
              key={empresa.id}
              value={empresa.id}
            >

              {empresa.nombre}

            </option>
          ))}

        </select>

        {/* RESPONSABLE */}

        <select
          value={responsableId}
          onChange={(e) =>
            setResponsableId(
              e.target.value
            )
          }
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            px-4
            py-4
            outline-none
          "
        >

          <option value="">
            Responsable
          </option>

          {colaboradores.map(
            (colaborador) => (

            <option
              key={colaborador.id}
              value={colaborador.id}
            >

              {colaborador.nombre}

            </option>
          ))}

        </select>

        {/* FECHA */}

        <input
          type="date"
          value={fecha}
          onChange={(e) =>
            setFecha(
              e.target.value
            )
          }
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            px-4
            py-4
            outline-none
          "
        />

        {/* TIPO */}

        <select
          value={tipo}
          onChange={(e) =>
            setTipo(
              e.target.value
            )
          }
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            px-4
            py-4
            outline-none
          "
        >

          <option value="">
            Tipo capacitación
          </option>

          <option>
            Manejo de extintores
          </option>

          <option>
            Primeros auxilios
          </option>

          <option>
            Evacuación
          </option>

          <option>
            Riesgo eléctrico
          </option>

          <option>
            Trabajo en alturas
          </option>

          <option>
            Inducción SST
          </option>

        </select>

        {/* OBS */}

        <input
          value={observaciones}
          onChange={(e) =>
            setObservaciones(
              e.target.value
            )
          }
          placeholder="
            Observaciones
          "
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            px-4
            py-4
            outline-none
          "
        />

      </div>

      {/* BOTON */}

      <button
        onClick={crearCapacitacion}
        className="
          flex
          items-center
          gap-2
          bg-blue-600
          hover:bg-blue-700
          transition
          px-6
          py-4
          rounded-2xl
          font-medium
          mb-10
        "
      >

        <Plus size={18} />

        Programar capacitación

      </button>

      {/* TABLA */}

      <div className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        overflow-hidden
      ">

        <table className="
          w-full
        ">

          <thead className="
            bg-zinc-950/50
            border-b
            border-zinc-800
          ">

            <tr>

              <th className="p-5 text-left">
                Fecha
              </th>

              <th className="p-5 text-left">
                Empresa
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

              <th className="p-5 text-left">
                Acción
              </th>

            </tr>

          </thead>

          <tbody>

            {capacitaciones.map(
              (capacitacion) => (

              <tr
                key={
                  capacitacion.id
                }
                className="
                  border-b
                  border-zinc-800
                "
              >

                <td className="p-5">

                  {
                    capacitacion.fecha
                  }

                </td>

                <td className="p-5">

                  {
                    capacitacion
                    .empresas
                    ?.nombre
                  }

                </td>

                <td className="p-5">

                  {
                    capacitacion.tipo
                  }

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

                    ${estadoColor(
                      capacitacion.estado
                    )}
                  `}>

                    {
                      capacitacion.estado
                    }

                  </span>

                </td>

                <td className="p-5">

                  {capacitacion.estado !==
                    "realizada" && (

                    <button
                      onClick={() =>
                        completarCapacitacion(
                          capacitacion.id
                        )
                      }
                      className="
                        bg-green-500/20
                        text-green-400
                        px-4
                        py-2
                        rounded-xl
                      "
                    >

                      Completar

                    </button>

                  )}

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}