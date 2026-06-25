"use client"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabase"

export default function ReportesPage() {

  const [actividades, setActividades] = useState<any[]>([])
  const [horasPorColaborador, setHorasPorColaborador] =
    useState<any[]>([])

  const [empresas, setEmpresas] =
    useState<any[]>([])

  const [empresaSeleccionada, setEmpresaSeleccionada] =
    useState("")

  const mesActual =
    new Date().toISOString().slice(0, 7)

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

    const inicioMes =
      `${mesSeleccionado}-01`

      const [anio, mes] = mesSeleccionado
  .split("-")
  .map(Number);

const finMes = new Date(
  anio,
  mes,
  0
)
  .toISOString()
  .split("T")[0];

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
.lte("fecha", finMes);

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

    console.table(
  data?.map((a: any) => ({
    fecha: a.fecha,
    empresa: a.empresas?.nombre,
    descripcion: a.descripcion,
  }))
);

    if (!data) return

    setActividades(data)
    
    console.table(
  data.map((a: any) => ({
    id: a.id,
    empresa: a.empresas?.nombre,
    descripcion: a.descripcion,
    horas: a.horas,
    horas_trabajo_id: a.horas_trabajo_id,
  }))
);

    // AGRUPAR HORAS

    const agrupadas: Record<string, number> = {}

    data.forEach((actividad: any) => {

      const nombre =
        actividad.colaboradores?.nombre ||
        "Sin nombre"

      agrupadas[nombre] =
        (agrupadas[nombre] || 0) +
        Number(actividad.horas)
    })

    const resultado = Object.entries(
      agrupadas
    ).map(([nombre, horas]) => ({
      nombre,
      horas,
    }))

    setHorasPorColaborador(resultado)
  }

  // TOTAL HORAS

  const totalHoras =
    horasPorColaborador.reduce(
      (acc, item) => acc + item.horas,
      0
    )

  // EMPRESA PDF

  const nombreEmpresa =
    empresas.find(
      (empresa) =>
        empresa.id === empresaSeleccionada
    )?.nombre || "Todas-las-Empresas"


    const totalFacturado = actividades.reduce(
  (acc, actividad) => acc + Number(actividad.total_facturado || 0),
  0
)

const colaboradoresUnicos = new Set(
  actividades.map(a => a.colaboradores?.nombre)
).size

const fechaGeneracion = new Date().toLocaleString("es-CO")

const [anio, mes] = mesSeleccionado
  .split("-")
  .map(Number);

const periodoTexto = new Date(
  anio,
  mes - 1,
  1
).toLocaleDateString("es-CO", {
  month: "long",
  year: "numeric",
});

  // EXPORTAR PDF

  async function exportarPDF() {

    const doc = new jsPDF()

    try {

      const response =
        await fetch("/logo.jpg")

      const blob =
        await response.blob()

      const reader =
        new FileReader()

      reader.readAsDataURL(blob)

      reader.onloadend = () => {

        const base64data =
          reader.result as string

        // LOGO

        doc.addImage(
          base64data,
          "JPEG",
          14,
          10,
          65,
          26
        )

        // TITULO

doc.setFont("helvetica", "bold")
doc.setFontSize(22)

doc.text(
  "REPORTE OPERATIVO MENSUAL",
  105,
  48,
  { align: "center" }
)

doc.setFontSize(12)

doc.setFont("helvetica", "normal")

doc.setFont("helvetica","bold")
doc.setFontSize(11)

doc.text(
"Empresa",
14,
60
)

doc.text(
"Período",
14,
78
)

doc.text(
"Fecha de generación",
14,
96
)

doc.setFont("helvetica","normal")

doc.setFontSize(12)

doc.text(
nombreEmpresa,
14,
67
)

doc.text(
periodoTexto.charAt(0).toUpperCase() +
periodoTexto.slice(1),
14,
85
)

doc.text(
new Date().toLocaleDateString(
"es-CO",
{
day:"numeric",
month:"long",
year:"numeric"
}
),
14,
103
)

doc.setDrawColor(40)

doc.line(14,112,196,112)



        // TABLA

        doc.setFillColor(240,245,255)

doc.roundedRect(
14,
118,
182,
26,
2,
2,
"F"
)

doc.setFont("helvetica","bold")
doc.setFontSize(12)

doc.text(
"Resumen Ejecutivo",
18,
126
)

doc.setFont("helvetica","normal")
doc.setFontSize(10)

doc.text(
`Actividades: ${actividades.length}`,
18,
134
)

doc.text(
`Colaboradores: ${colaboradoresUnicos}`,
80,
104
)

doc.text(
`Horas: ${totalHoras} h`,
18,
141
)

doc.text(
`Facturación: $${totalFacturado.toLocaleString("es-CO")}`,
80,
111
)
        autoTable(doc, {

          startY: 150,

          head: [[
            "Fecha",
            "Colaborador",
            "Actividad",
            "Horas",
          ]],

          body: actividades.map(
            (actividad) => [

              actividad.fecha,

              actividad.colaboradores?.nombre || "-",

              actividad.descripcion,

              `${actividad.horas}h`,
            ]
          ),

          theme: "grid",

          styles: {
            fillColor: [10, 10, 20],
            textColor: 255,
            lineColor: [40, 40, 60],
            lineWidth: 0.2,
            fontSize: 10,
          },

          headStyles: {
            fillColor: [30, 64, 175],
            textColor: 255,
            fontStyle: "bold",
          },

          alternateRowStyles: {
            fillColor: [18, 18, 30],
          },

          columnStyles:{
0:{cellWidth:22},

1:{cellWidth:35},

2:{cellWidth:115},

3:{
cellWidth:20,
halign:"center"
}
},
        })

const finalY =
(doc as any).lastAutoTable.finalY


        // DESCARGAR

        doc.setDrawColor(180)

doc.line(
14,
finalY+42,
196,
finalY+42
)

doc.setFontSize(9)

doc.setTextColor(120)

doc.text(
"Documento generado automáticamente por SEITON Soluciones Empresariales",
14,
finalY+50
)

doc.text(
fechaGeneracion,
196,
finalY+50,
{
align:"right"
}
)
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
    <div className="max-w-[1200px]">

      {/* HEADER */}

      <div className="mb-10">

        <h1 className="
          text-5xl
          font-black
          tracking-tight
          mb-3
        ">

          Reportes

        </h1>

        <p className="
          text-zinc-400
          text-lg
        ">

          Reporte operativo mensual

        </p>

      </div>

      {/* FILTROS */}

      <div className="
        flex
        flex-wrap
        items-center
        gap-4
        mb-8
      ">

        {/* MES */}

        <input
          type="month"
          value={mesSeleccionado}
          onChange={(e) =>
            setMesSeleccionado(
              e.target.value
            )
          }
          className="
            bg-[#0b1020]
            border
            border-zinc-800
            rounded-2xl
            px-5
            py-3
            outline-none
            text-white
          "
        />

        {/* EMPRESA */}

        <select
          value={empresaSeleccionada}
          onChange={(e) =>
            setEmpresaSeleccionada(
              e.target.value
            )
          }
          className="
            bg-[#0b1020]
            border
            border-zinc-800
            rounded-2xl
            px-5
            py-3
            outline-none
            text-white
          "
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

        {/* BOTON */}

        <button
          onClick={exportarPDF}
          className="
            px-6
            py-3
            rounded-2xl
            font-semibold
            bg-blue-500
            hover:bg-blue-400
            transition
            shadow-lg
            shadow-blue-500/20
          "
        >

          Exportar PDF

        </button>

      </div>

      {/* RESUMEN */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-5
        mb-10
      ">

        {horasPorColaborador.map((item) => (

          <div
            key={item.nombre}
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-gradient-to-br
              from-[#0b1020]
              to-[#050816]
              p-6
              shadow-xl
            "
          >

            <h2 className="
              text-lg
              text-zinc-400
              mb-3
            ">

              {item.nombre}

            </h2>

            <p className="
              text-5xl
              font-black
              text-green-400
            ">

              {item.horas}h

            </p>

          </div>

        ))}

      </div>

      {/* TOTAL */}

      <div className="
        mb-10
        rounded-3xl
        border
        border-zinc-800
        bg-gradient-to-br
        from-[#0b1020]
        to-[#050816]
        p-7
        shadow-xl
      ">

        <h2 className="
          text-xl
          text-zinc-400
          mb-3
        ">

          Total mensual

        </h2>

        <p className="
          text-6xl
          font-black
          text-blue-400
        ">

          {totalHoras}h

        </p>

      </div>

      {/* TABLA */}

      <div className="
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-[#0b1020]
        shadow-2xl
      ">

        <table className="w-full">

          <thead className="
            bg-zinc-950/50
            border-b
            border-zinc-800
          ">

            <tr className="text-left">

              <th className="p-5 text-zinc-400">
                Fecha
              </th>

              <th className="p-5 text-zinc-400">
                Colaborador
              </th>

              <th className="p-5 text-zinc-400">
                Empresa
              </th>

              <th className="p-5 text-zinc-400">
                Actividad
              </th>

              <th className="p-5 text-zinc-400">
                Horas
              </th>

            </tr>

          </thead>

          <tbody>

            {actividades.map((actividad) => (

              <tr
                key={actividad.id}
                className="
                  border-b
                  border-zinc-800
                  hover:bg-white/5
                  transition
                "
              >

                <td className="p-5">
                  {actividad.fecha}
                </td>

                <td className="
                  p-5
                  font-semibold
                ">
                  {actividad.colaboradores?.nombre}
                </td>

                <td className="p-5">
                  {actividad.empresas?.nombre}
                </td>

                <td className="p-5">
                  {actividad.descripcion}
                </td>


                <td className="
                  p-5
                  text-green-400
                  font-bold
                ">
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