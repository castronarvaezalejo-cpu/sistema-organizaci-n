"use client"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabase"

export default function ReportesPage() {

  const [actividades, setActividades] = useState<any[]>([])
  const [horasPorColaborador, setHorasPorColaborador] = useState<any[]>([])

  const [empresas, setEmpresas] = useState<any[]>([])

  const [empresaSeleccionada, setEmpresaSeleccionada] =
    useState("")

  const mesActual = new Date().toISOString().slice(0, 7)

  const [mesSeleccionado, setMesSeleccionado] =
    useState(mesActual)

  useEffect(() => {

    obtenerEmpresas()
    cargarReporte()

  }, [mesSeleccionado, empresaSeleccionada])

  // OBTENER EMPRESAS

  async function obtenerEmpresas() {

    const { data } = await supabase
      .from("empresas")
      .select("*")
      .order("nombre")

    if (data) {
      setEmpresas(data)
    }
  }

  // CARGAR REPORTE

  async function cargarReporte() {

    const inicioMes = `${mesSeleccionado}-01`

    let query = supabase
      .from("actividades_realizadas")
      .select(`
        *,
        colaboradores (
          nombre
        ),
        empresas (
          nombre
        ),
        tareas (
          titulo
        )
      `)
      .gte("fecha", inicioMes)

    // FILTRO EMPRESA

    if (empresaSeleccionada) {

      query = query.eq(
        "empresa_id",
        empresaSeleccionada
      )
    }

    const { data } = await query.order(
      "fecha",
      { ascending: false }
    )

    if (!data) return

    setActividades(data)

    // AGRUPAR HORAS

    const agrupadas: Record<string, number> = {}

    data.forEach((actividad: any) => {

      const nombre =
        actividad.colaboradores?.nombre || "Sin nombre"

      agrupadas[nombre] =
        (agrupadas[nombre] || 0) +
        Number(actividad.horas)
    })

    const resultado = Object.entries(agrupadas).map(
      ([nombre, horas]) => ({
        nombre,
        horas,
      })
    )

    setHorasPorColaborador(resultado)
  }

  // TOTAL HORAS

  const totalHoras = horasPorColaborador.reduce(
    (acc, item) => acc + item.horas,
    0
  )

  // NOMBRE EMPRESA PDF

  const nombreEmpresa =
    empresas.find(
      (empresa) =>
        empresa.id === empresaSeleccionada
    )?.nombre || "Todas-las-Empresas"

  // EXPORTAR PDF

  async function exportarPDF() {

    const doc = new jsPDF()

    try {

      // CARGAR LOGO

      const response = await fetch("/logo.jpg")

      const blob = await response.blob()

      const reader = new FileReader()

      reader.readAsDataURL(blob)

      reader.onloadend = () => {

        const base64data = reader.result as string

        // LOGO

        doc.addImage(
          base64data,
          "JPEG",
          14,
          10,
          55,
          22
        )

        // TITULO

        doc.setFontSize(20)

        doc.text(
          `Reporte Operativo`,
          14,
          42
        )

        doc.setFontSize(12)

        doc.text(
          `Mes: ${mesSeleccionado}`,
          14,
          52
        )

        doc.text(
          `Empresa: ${nombreEmpresa}`,
          14,
          60
        )

        doc.text(
          `Total Horas: ${totalHoras}h`,
          14,
          68
        )

        // TABLA

        autoTable(doc, {

          startY: 78,

          head: [[
            "Fecha",
            "Colaborador",
            "Empresa",
            "Actividad",
            "Tarea",
            "Horas",
          ]],

          body: actividades.map((actividad) => [

            actividad.fecha,

            actividad.colaboradores?.nombre || "-",

            actividad.empresas?.nombre || "-",

            actividad.descripcion,

            actividad.tareas?.titulo || "-",

            `${actividad.horas}h`,
          ]),
        })

        // DESCARGAR PDF

        doc.save(
          `Reporte-${nombreEmpresa}-${mesSeleccionado}.pdf`
        )
      }

    } catch (error) {

      console.error(error)

      alert("Error generando PDF")
    }
  }

  return (
    <div>

      <h1 className="text-4xl font-bold mb-2">
        Reportes
      </h1>

      <p className="text-zinc-400 mb-10">
        Reporte operativo mensual
      </p>

      {/* FILTROS + PDF */}

      <div className="flex flex-wrap items-center gap-4 mb-8">

        {/* MES */}

        <input
          type="month"
          value={mesSeleccionado}
          onChange={(e) =>
            setMesSeleccionado(e.target.value)
          }
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none"
        />

        {/* EMPRESA */}

        <select
          value={empresaSeleccionada}
          onChange={(e) =>
            setEmpresaSeleccionada(e.target.value)
          }
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none"
        >

          <option value="">
            Todas las empresas
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

        {/* PDF */}

        <button
          onClick={exportarPDF}
          className="bg-white text-black px-5 py-3 rounded-xl font-medium hover:opacity-90 transition"
        >

          Exportar PDF

        </button>

      </div>

      {/* RESUMEN */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

        {horasPorColaborador.map((item) => (

          <div
            key={item.nombre}
            className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6"
          >

            <h2 className="text-xl font-semibold mb-2">
              {item.nombre}
            </h2>

            <p className="text-3xl font-bold text-green-400">
              {item.horas}h
            </p>

          </div>

        ))}

      </div>

      {/* TOTAL */}

      <div className="mb-12 border border-zinc-800 bg-zinc-900 rounded-2xl p-6">

        <h2 className="text-xl font-semibold mb-2">
          Total mensual
        </h2>

        <p className="text-4xl font-bold text-blue-400">
          {totalHoras}h
        </p>

      </div>

      {/* TABLA */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

        <table className="w-full">

          <thead className="border-b border-zinc-800 bg-zinc-950/40">

            <tr className="text-left">

              <th className="p-5 text-zinc-400 font-medium">
                Fecha
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Colaborador
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Empresa
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Actividad
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Tarea
              </th>

              <th className="p-5 text-zinc-400 font-medium">
                Horas
              </th>

            </tr>

          </thead>

          <tbody>

            {actividades.map((actividad) => (

              <tr
                key={actividad.id}
                className="border-b border-zinc-800 hover:bg-zinc-800/40 transition"
              >

                <td className="p-5">
                  {actividad.fecha}
                </td>

                <td className="p-5 font-medium">
                  {actividad.colaboradores?.nombre}
                </td>

                <td className="p-5">
                  {actividad.empresas?.nombre}
                </td>

                <td className="p-5">
                  {actividad.descripcion}
                </td>

                <td className="p-5">
                  {actividad.tareas?.titulo || "-"}
                </td>

                <td className="p-5">
                  {actividad.horas}h
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}