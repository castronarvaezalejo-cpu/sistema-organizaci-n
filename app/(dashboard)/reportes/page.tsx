"use client"

import jsPDF from "jspdf"



import {
  ActividadPDF,
  dibujarTablaActividadesAutoTable,
  obtenerFinalAutoTable,
} from "@/lib/pdf/cuenta-cobro";

import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabase"

import PageHeader from "@/components/ui/PageHeader"
import EmpresaSearchSelect from "@/components/ui/EmpresaSearchSelect"

type EmpresaReporte = {
  id: string
  nombre: string
  nit?: string | null
  tarifa_hora?: number | string | null
}

type ActividadReporte = {
  id: string
  fecha: string
  descripcion?: string | null
  horas?: number | string | null
  total_facturado?: number | string | null
  facturada?: boolean | null
  colaboradores?: {
    nombre?: string | null
  } | null
  empresas?: {
    nombre?: string | null
  } | null
  tareas?: {
    titulo?: string | null
  } | null
}

export default function ReportesPage() {

  const [actividades, setActividades] = useState<ActividadReporte[]>([])
  const [actividadesSeleccionadas, setActividadesSeleccionadas] =
    useState<string[]>([])
  const [empresas, setEmpresas] =
    useState<EmpresaReporte[]>([])

  const [empresaSeleccionada, setEmpresaSeleccionada] =
    useState("")

  const [estadoFacturacion, setEstadoFacturacion] =
    useState("disponibles")

const mesActual =
  new Date().toISOString().slice(0, 7)

const [mesInicio, setMesInicio] =
  useState(mesActual)

  const [mesFin, setMesFin] =
  useState(mesActual)

  useEffect(() => {

    obtenerEmpresas()
    cargarReporte()

    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [mesInicio, mesFin, empresaSeleccionada, estadoFacturacion])

  // OBTENER EMPRESAS

  async function obtenerEmpresas() {

    const { data } = await supabase
      .from("empresas")
      .select("*")
      .order("nombre")

    if (data) {
      setEmpresas(data as EmpresaReporte[])
    }
  }

  // CARGAR REPORTE

  async function cargarReporte() {

const inicioMes =
  `${mesInicio}-01`;

const [anio, mes] =
  mesFin
    .split("-")
    .map(Number);

const finMes =
  `${mesFin}-${new Date(
    anio,
    mes,
    0
  ).getDate()}`;

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

    if (estadoFacturacion === "disponibles") {
      query = query.eq("facturada", false)
    }

    if (estadoFacturacion === "facturadas") {
      query = query.eq("facturada", true)
    }

    const { data } = await query.order(
      "fecha",
      { ascending: false }
    )

    if (!data) return

    setActividades(data as ActividadReporte[])
    setActividadesSeleccionadas(
      (data as ActividadReporte[]).map((actividad) => actividad.id)
    )
    
  }

  const actividadesParaCuenta =
    actividades.filter((actividad) =>
      actividadesSeleccionadas.includes(
        actividad.id
      )
    )

  const horasPorColaboradorSeleccionadas =
    Object.entries(
      actividadesParaCuenta.reduce(
        (
          acc: Record<string, number>,
          actividad: ActividadReporte
        ) => {
          const nombre =
            actividad.colaboradores?.nombre ||
            "Sin nombre"

          acc[nombre] =
            (acc[nombre] || 0) +
            Number(actividad.horas)

          return acc
        },
        {}
      )
    ).map(([nombre, horas]) => ({
      nombre,
      horas,
    }))

  function alternarActividad(id: string) {
    setActividadesSeleccionadas((actuales) =>
      actuales.includes(id)
        ? actuales.filter((item) => item !== id)
        : [...actuales, id]
    )
  }

  function alternarTodas() {
    if (
      actividadesSeleccionadas.length ===
      actividades.length
    ) {
      setActividadesSeleccionadas([])
      return
    }

    setActividadesSeleccionadas(
      actividades.map((actividad) => actividad.id)
    )
  }

  // TOTAL HORAS

  const totalHoras =
    actividadesParaCuenta.reduce(
      (acc, actividad) =>
        acc + Number(actividad.horas),
      0
    )

  // EMPRESA PDF

  const nombreEmpresa =
    empresas.find(
      (empresa) =>
        empresa.id === empresaSeleccionada
    )?.nombre || "Todas-las-Empresas"


    const nitEmpresa =
  empresas.find(
    (empresa) =>
      empresa.id === empresaSeleccionada
  )?.nit || ""

const fechaGeneracion = new Date().toLocaleString("es-CO")

function formatearMes(mes: string) {

  const [anio, numeroMes] = mes
    .split("-")
    .map(Number);

  return new Date(
    anio,
    numeroMes - 1,
    1
  ).toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });

}

const periodoTexto =
  mesInicio === mesFin
    ? formatearMes(mesInicio)
    : `${formatearMes(mesInicio)} - ${formatearMes(mesFin)}`;

  async function ajustarRedondeoCuentaCobro() {
    const actividadesAjustadas =
      actividadesParaCuenta.map((actividad) => ({
        ...actividad,
        total_facturado: Math.round(
          Number(actividad.total_facturado || 0)
        ),
      }))

    if (
      !empresaSeleccionada ||
      actividadesAjustadas.length === 0
    ) {
      return actividadesAjustadas
    }

    const empresa =
      empresas.find(
        (item) =>
          item.id === empresaSeleccionada
      )

    const valorEsperado =
      Math.round(
        Number(empresa?.tarifa_hora || 0)
      )

    if (!valorEsperado) {
      return actividadesAjustadas
    }

    const sumaTotal =
      actividadesAjustadas.reduce(
        (acc, actividad) =>
          acc + Number(actividad.total_facturado || 0),
        0
      )

    const diferencia =
      valorEsperado - sumaTotal

    if (
      diferencia !== 0 &&
      Math.abs(diferencia) <=
        actividadesAjustadas.length
    ) {
      const ultimaActividad =
        actividadesAjustadas[
          actividadesAjustadas.length - 1
        ]

      if (ultimaActividad) {
        ultimaActividad.total_facturado =
          Number(
            ultimaActividad.total_facturado || 0
          ) + diferencia
      }
    }

    await Promise.all(
      actividadesAjustadas.map((actividad) =>
        supabase
          .from("actividades_realizadas")
          .update({
            total_facturado:
              actividad.total_facturado,
          })
          .eq("id", actividad.id)
      )
    )

    setActividades((actuales) =>
      actuales.map((actividad) => {
        const ajustada =
          actividadesAjustadas.find(
            (item) => item.id === actividad.id
          )

        return ajustada || actividad
      })
    )

    return actividadesAjustadas
  }

  async function marcarActividadesFacturadas(
    cuentaCobroId: string
  ) {
    const actividadIds =
      actividadesParaCuenta.map(
        (actividad) => actividad.id
      )

    if (actividadIds.length === 0) {
      return false
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      alert("No hay una sesión válida para facturar.")
      return false
    }

    const response = await fetch(
      "/api/reportes/facturar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          actividadIds,
          cuentaCobroId,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok || !result.ok) {
      console.error(result)
      alert(
        result.error ||
        "No fue posible marcar las actividades como facturadas."
      )
      return false
    }

    await cargarReporte()

    return true
  }

  // EXPORTAR PDF

  async function exportarPDF() {

    if (actividadesParaCuenta.length === 0) {
      alert("Selecciona al menos una actividad para generar la cuenta de cobro.")
      return
    }

    const actividadesCuentaPDF =
      await ajustarRedondeoCuentaCobro()

    const totalFacturadoPDF =
      actividadesCuentaPDF.reduce(
        (acc, actividad) =>
          acc + Number(actividad.total_facturado || 0),
        0
      )

    const cuentaCobroId =
      crypto.randomUUID()

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
52,
25
)

        // TITULO

doc.setFont("helvetica", "bold")
doc.setFontSize(20)

doc.setTextColor(20,70,140)

doc.text(
  "CUENTA DE COBRO",
  105,
  40,
  { align: "center" }
)

doc.setTextColor(0)

doc.setFontSize(12)

doc.setFont("helvetica", "normal")

doc.setFont("helvetica","bold")
doc.setFontSize(11)


doc.text(
"Empresa",
18,
52
)

doc.text(
nombreEmpresa,
18,
59
)

doc.text(
"NIT",
18,
69
)

doc.text(
nitEmpresa || "-",
18,
76
)

doc.text(
"Período",
18,
86
)

doc.text(
periodoTexto.charAt(0).toUpperCase() +
periodoTexto.slice(1),
18,
93
)

doc.text(
"Fecha de generación",
18,
103
)

doc.text(
new Date().toLocaleDateString(
"es-CO",
{
  day: "numeric",
  month: "long",
  year: "numeric"
}
),
18,
110
)

doc.setDrawColor(40)

doc.line(18,119,192,119)

doc.setFont("helvetica","normal")

doc.setFontSize(10)

doc.text(
  "Por medio de la presente se relacionan las actividades ejecutadas durante el período indicado, como soporte de los servicios prestados en Seguridad y Salud en el Trabajo.",
  18,
  125,
  {
    maxWidth:174
  }
)



        // TABLA

// Caja resumen

doc.setDrawColor(
190,
215,
245
);
doc.setFillColor(247,251,255);

doc.roundedRect(
18,
132,
174,
20,
2,
2,
"FD"
);

doc.setFont("helvetica","bold")
doc.setFontSize(12)

doc.text(
"Descripción de las actividades",
24,
139
)

doc.setFont("helvetica","normal")
doc.setFontSize(10)

doc.text(
`Actividades: ${actividadesCuentaPDF.length}`,
24,
145
)



doc.text(
`Horas: ${totalHoras} h`,
24,
150
)

doc.text(
`Valor a cobrar: $${totalFacturadoPDF.toLocaleString("es-CO")}`,
100,
150
)

const actividadesPDF: ActividadPDF[] =
  actividadesCuentaPDF.map((actividad) => ({
    fecha: actividad.fecha,
    colaborador:
      actividad.colaboradores?.nombre || "-",
    descripcion:
      actividad.descripcion || "",
    horas: actividad.horas as number,
  }));

dibujarTablaActividadesAutoTable(
  doc,
  actividadesPDF,
  158
);

const finalY =
  obtenerFinalAutoTable(doc);

let firmaY = finalY + 20;

if (firmaY > 230) {

  doc.addPage();

  firmaY = 25;

}

// Cargar firma

fetch("/firma-jully.png")
  .then(res => res.blob())
  .then(blob => {

    const reader = new FileReader();

    reader.readAsDataURL(blob);

    reader.onloadend = async () => {

      const firma =
        reader.result as string;

        doc.addImage(
firma,
"PNG",
18,
firmaY + 2,
48,
28
)


      doc.setFontSize(11);

      doc.setTextColor(0);

      doc.text(
        "Att.",
        18,
        firmaY
      );


      doc.setFontSize(10);

      doc.text(
        "Jully Dayám Narváez Benavides",
        18,
        firmaY + 32
      );

      doc.text(
        "C.C. 59.314.290 de Pasto",
        18,
        firmaY + 38
      );

      doc.text(
        "Terapeuta Ocupacional",
        18,
        firmaY + 44
      );

      doc.text(
        "Especialista en Gerencia de la Salud Ocupacional",
        18,
        firmaY + 50
      );

      // Cuadro de sello

      doc.setDrawColor(190,220,250);

doc.rect(
135,
firmaY,
60,
45
)

      doc.setTextColor(170);

      doc.text(
        "Espacio para firma y sello de",
        167.5,
        firmaY + 20,
        {
          align:"center"
        }
      );

      doc.text(
        "cancelado",
        167.5,
        firmaY + 27,
        {
          align:"center"
        }
      );

      // Aquí continúa el pie de página


        // DESCARGAR

        doc.setDrawColor(180)

doc.line(
14,
firmaY + 60,
196,
firmaY + 60
)

doc.setFontSize(9)

doc.setTextColor(120)

doc.text(
"Documento generado automáticamente por SEITON Soluciones Empresariales",
14,
firmaY + 68
)

doc.text(
fechaGeneracion,
196,
firmaY + 68,
{
align:"right"
}
)
const facturacionGuardada =
  await marcarActividadesFacturadas(
    cuentaCobroId
  );

if (!facturacionGuardada) {
  return;
}

doc.save(
  `Cuenta de Cobro - ${nombreEmpresa}.pdf`
);
      };

      });

  
     
     };

    } catch (error) {

      console.error(error)

      alert("Error generando PDF")
    }
  }

  return (
    <div className="max-w-[1200px]">

      <PageHeader
        title="Reportes"
        description="Reporte operativo mensual y cuentas de cobro"
      />

      {/* FILTROS */}

      <div className="
        flex
        flex-wrap
        items-end
        gap-4
        mb-6
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
      ">

        {/* MES */}

<div className="flex gap-4">

  <div>

    <label className="block text-sm font-medium text-slate-600 mb-2">
      Desde
    </label>

    <input
      type="month"
      value={mesInicio}
      onChange={(e) =>
        setMesInicio(e.target.value)
      }
      className="
        bg-white
        border
        border-slate-200
        rounded-xl
        px-4
        py-2.5
        outline-none
        text-sm
        text-slate-800
        shadow-sm
      "
    />

  </div>

  <div>

    <label className="block text-sm font-medium text-slate-600 mb-2">
      Hasta
    </label>

    <input
      type="month"
      value={mesFin}
      onChange={(e) =>
        setMesFin(e.target.value)
      }
      className="
        bg-white
        border
        border-slate-200
        rounded-xl
        px-4
        py-2.5
        outline-none
        text-sm
        text-slate-800
        shadow-sm
      "
    />

  </div>

</div>

{/* EMPRESA */}

<div>

  <label className="block text-sm font-medium text-slate-600 mb-2">
    Empresa
  </label>

  <EmpresaSearchSelect
    empresas={[
      {
        id: "",
        nombre: "Todas las empresas",
      },
      ...empresas,
    ]}
    value={empresaSeleccionada}
    onChange={setEmpresaSeleccionada}
    placeholder="Todas las empresas"
  />

        </div>

{/* ESTADO FACTURACIÓN */}

<div>

  <label className="block text-sm font-medium text-slate-600 mb-2">
    Estado
  </label>

  <select
    value={estadoFacturacion}
    onChange={(e) =>
      setEstadoFacturacion(e.target.value)
    }
    className="
      bg-white
      border
      border-slate-200
      rounded-xl
      px-4
      py-2.5
      outline-none
      text-sm
      text-slate-800
      shadow-sm
    "
  >
    <option value="disponibles">
      Disponibles
    </option>

    <option value="facturadas">
      Facturadas
    </option>

    <option value="todas">
      Todas
    </option>
  </select>

</div>

        {/* BOTON */}

        <button
          onClick={exportarPDF}
          className="
            px-5
            py-2.5
            rounded-xl
            font-semibold
            bg-[#0B4A92]
            hover:bg-[#0B75C9]
            text-white
            transition
            shadow-sm
            h-[42px]
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
        gap-4
        mb-6
      ">

        {horasPorColaboradorSeleccionadas.map((item) => (

          <div
            key={item.nombre}
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-4
              shadow-sm
            "
          >

            <h2 className="
              text-sm
              text-slate-500
              mb-2
            ">

              {item.nombre}

            </h2>

            <p className="
              text-3xl
              font-black
              text-emerald-700
            ">

              {item.horas}h

            </p>

          </div>

        ))}

      </div>

      {/* TOTAL */}

      <div className="
        mb-6
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
      ">

        <h2 className="
          text-sm
          font-semibold
          text-slate-500
          mb-2
        ">

          Total mensual

        </h2>

        <p className="
          text-4xl
          font-black
          text-blue-700
        ">

          {totalHoras}h

        </p>

      </div>

      {/* TABLA */}

      <div className="mb-3 text-sm text-slate-500">
        Se incluirán {actividadesParaCuenta.length} de {actividades.length} actividades en la cuenta de cobro.
      </div>

      <div className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
      ">

        <table className="w-full">

          <thead className="
            bg-blue-50
            border-b
            border-slate-200
          ">

            <tr className="text-left">

              <th className="p-4 text-slate-600">
                <button
                  type="button"
                  onClick={alternarTodas}
                  className="
                    text-xs
                    font-semibold
                    text-blue-700
                    hover:underline
                  "
                >
                  {actividadesSeleccionadas.length === actividades.length
                    ? "Quitar"
                    : "Todas"}
                </button>
              </th>

              <th className="p-4 text-slate-600">
                Fecha
              </th>

              <th className="p-4 text-slate-600">
                Colaborador
              </th>

              <th className="p-4 text-slate-600">
                Empresa
              </th>

              <th className="p-4 text-slate-600">
                Actividad
              </th>

              <th className="p-4 text-slate-600">
                Horas
              </th>

              <th className="p-4 text-slate-600">
                Estado
              </th>

            </tr>

          </thead>

          <tbody>

            {actividades.map((actividad) => (

              <tr
                key={actividad.id}
                className="
                  border-b
                  border-slate-200
                  hover:bg-blue-50/60
                  transition
                "
              >

                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={actividadesSeleccionadas.includes(
                      actividad.id
                    )}
                    onChange={() =>
                      alternarActividad(actividad.id)
                    }
                    className="
                      h-4
                      w-4
                      rounded
                      border-slate-300
                      accent-[#0B4A92]
                    "
                    aria-label="Incluir actividad en cuenta de cobro"
                  />
                </td>

                <td className="p-4">
                  {actividad.fecha}
                </td>

                <td className="
                  p-4
                  font-semibold
                ">
                  {actividad.colaboradores?.nombre}
                </td>

                <td className="p-4">
                  {actividad.empresas?.nombre}
                </td>

                <td className="p-4">
                  {actividad.descripcion}
                </td>


                <td className="
                  p-4
                  text-emerald-700
                  font-bold
                ">
                  {actividad.horas}h
                </td>

                <td className="p-4">
                  <span className={`
                    inline-flex
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    ${actividad.facturada
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-blue-50 text-blue-700"
                    }
                  `}>
                    {actividad.facturada
                      ? "Facturada"
                      : "Disponible"}
                  </span>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}
