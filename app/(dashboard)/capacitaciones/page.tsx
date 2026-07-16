"use client"

import { useEffect, useState }
from "react"

import {
  Plus,
  CalendarDays,
  Pencil,
  Trash2,
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

    const [hora, setHora] =
  useState("")

const [lugar, setLugar] =
  useState("")

  const [
    observaciones,
    setObservaciones,
  ] = useState("")

  const [
  editandoId,
  setEditandoId,
] = useState("")

const [
  modoEdicion,
  setModoEdicion,
] = useState(false)

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

async function crearEventoGoogleCalendar(): Promise<string | null> {
  if (!responsableId || !fecha) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const empresaSeleccionada = empresas.find(
    (empresa) => empresa.id === empresaId
  );

  const response = await fetch("/api/google-calendar/event", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      colaboradorId: responsableId,
      title: `Capacitación: ${tipo}`,
      description:
        observaciones ||
        `Empresa: ${empresaSeleccionada?.nombre || "Sin empresa"}`,
      date: fecha,
      time: hora || undefined,
      durationMinutes: 60,
      location: lugar || undefined,
    }),
  });

const datos = await response.json();

console.log("GOOGLE STATUS:", response.status);
console.log("GOOGLE RESPUESTA:", datos);

if (datos.created && datos.eventId) {
  return datos.eventId;
}

return null;
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

const {
  data: nuevaCapacitacion,
  error,
} = await supabase
  .from("capacitaciones")
  .insert([
    

          {
            empresa_id:
              empresaId,

            responsable_id:
              responsableId || null,

            tipo,

fecha,

hora,

lugar,

observaciones,

            estado:
              "programada",
          },
        ])

        .select()
.single();

    if (error) {

      console.log(error)

      alert(
        "Error guardando"
      )

      return
    }

const eventId = await crearEventoGoogleCalendar();

if (eventId) {
  await supabase
    .from("capacitaciones")
    .update({
      google_calendar_event_id: eventId,
    })
    .eq("id", nuevaCapacitacion.id);
}

    alert(
      "Capacitación creada"
    )

    setEmpresaId("")
    setResponsableId("")
    setTipo("")
    setFecha("")
setHora("")
setLugar("")
setObservaciones("")

    obtenerCapacitaciones()
  }


  async function actualizarCapacitacion() {

const {
  data: capacitacionActualizada,
  error,
} = await supabase
  .from("capacitaciones")
  .update({

        empresa_id:
          empresaId,

        responsable_id:
          responsableId || null,

        tipo,

        fecha,

        hora,

        lugar,

        observaciones,
      })
      
      .eq(
        "id",
        editandoId
      )
.select()
.single()
  if (error) {

    console.log(error)

    alert(
      "Error actualizando"
    )

    return
  }

  if (
  capacitacionActualizada?.google_calendar_event_id &&
  responsableId
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const empresaSeleccionada = empresas.find(
      (empresa) => empresa.id === empresaId
    );

    const respuestaGoogle = await fetch(
      "/api/google-calendar/event",
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId:
            capacitacionActualizada.google_calendar_event_id,
          colaboradorId: responsableId,
          title: `Capacitación: ${tipo}`,
          description:
            observaciones ||
            `Empresa: ${empresaSeleccionada?.nombre || "Sin empresa"}`,
          date: fecha,
          time: hora || undefined,
          durationMinutes: 60,
          location: lugar || undefined,
        }),
      }
    );

    console.log(
      "PATCH GOOGLE:",
      await respuestaGoogle.text()
    );
  }
}

  alert(
    "Capacitación actualizada"
  )

  limpiarFormulario()

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


  function editarCapacitacion(
  capacitacion: any
) {

  setModoEdicion(true)

  setEditandoId(
    capacitacion.id
  )

  setEmpresaId(
    capacitacion.empresa_id
  )

  setResponsableId(
    capacitacion.responsable_id || ""
  )

  setTipo(
    capacitacion.tipo || ""
  )

  setFecha(
    capacitacion.fecha || ""
  )

  setHora(
    capacitacion.hora || ""
  )

  setLugar(
    capacitacion.lugar || ""
  )

  setObservaciones(
    capacitacion.observaciones || ""
  )
}

function limpiarFormulario() {

  setEmpresaId("")
  setResponsableId("")
  setTipo("")
  setFecha("")
  setHora("")
  setLugar("")
  setObservaciones("")

  setModoEdicion(false)

  setEditandoId("")
}
async function eliminarCapacitacion(id: string) {

  const confirmar = window.confirm(
    "¿Deseas eliminar esta capacitación?"
  )

  if (!confirmar) return
  
  const { data: capacitacion } = await supabase
  .from("capacitaciones")
  .select("google_calendar_event_id, responsable_id")
  .eq("id", id)
  .single();

  if (
  capacitacion?.google_calendar_event_id &&
  capacitacion?.responsable_id
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const respuestaGoogle = await fetch(
      "/api/google-calendar/event/delete",
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: capacitacion.google_calendar_event_id,
          colaboradorId: capacitacion.responsable_id,
        }),
      }
    );

    console.log(
      "DELETE GOOGLE:",
      await respuestaGoogle.text()
    );
  }
}

  const { error } = await supabase
    .from("capacitaciones")
    .delete()
    .eq("id", id)

  if (error) {

    console.error(error)

    alert("No fue posible eliminar la capacitación.")

    return

  }

  if (editandoId === id) {

    limpiarFormulario()

  }

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
          text-4xl
          font-black
          mb-3
        ">

          Capacitaciones

        </h1>

        <p className="
          text-slate-500
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
            bg-white
            border
            border-slate-200
            rounded-2xl
            px-4
            py-3
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
            bg-white
            border
            border-slate-200
            rounded-2xl
            px-4
            py-3
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
            bg-white
            border
            border-slate-200
            rounded-2xl
            px-4
            py-3
            outline-none
          "
        />

        {/* HORA */}

<input
  type="time"
  value={hora}
  onChange={(e) =>
    setHora(
      e.target.value
    )
  }
  className="
    bg-white
    border
    border-slate-200
    rounded-2xl
    px-4
    py-3
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
            bg-white
            border
            border-slate-200
            rounded-2xl
            px-4
            py-3
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

          <option>
            Capacitación al Vigía de SST o COPASST
          </option>


        </select>

        {/* LUGAR */}

<input
  value={lugar}
  onChange={(e) =>
    setLugar(
      e.target.value
    )
  }
  placeholder="
    Lugar / Barrio
  "
  className="
    bg-white
    border
    border-slate-200
    rounded-2xl
    px-4
    py-3
    outline-none
  "
/>

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
            bg-white
            border
            border-slate-200
            rounded-2xl
            px-4
            py-3
            outline-none
          "
        />

      </div>

{/* BOTONES */}

<div className="flex gap-3 mb-10">

  <button
    onClick={
      modoEdicion
        ? actualizarCapacitacion
        : crearCapacitacion
    }
    className="
      flex
      items-center
      gap-2
      bg-blue-600
      hover:bg-blue-700
      transition
      px-5
      py-3
      rounded-2xl
      font-medium
      text-white
    "
  >

    <Plus size={18} />

    {modoEdicion
      ? "Actualizar capacitación"
      : "Programar capacitación"}

  </button>

    <button
      onClick={limpiarFormulario}
      className="
        bg-slate-100
        hover:bg-slate-200
        transition
        px-5
        py-3
        rounded-2xl
        font-medium
      "
    >

      Cancelar

    </button>

</div>

      {/* TABLA */}

      <div className="
        bg-white
        border
        border-slate-200
        rounded-2xl
        overflow-hidden
      ">

        <table className="
          w-full
        ">

          <thead className="
            bg-blue-50
            border-b
            border-slate-200
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
  Hora
</th>

<th className="p-5 text-left">
  Lugar
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
                  border-slate-200
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
    capacitacion.hora || "-"
  }

</td>

<td className="p-5">

  {
    capacitacion.lugar || "-"
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

  <div className="flex items-center gap-2">

    {/* EDITAR */}

    <button
      onClick={() => editarCapacitacion(capacitacion)}
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

    {/* ELIMINAR */}

    <button
      onClick={() =>
        eliminarCapacitacion(capacitacion.id)
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

    {/* COMPLETAR */}

    {capacitacion.estado !== "realizada" && (

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

  </div>

</td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}   
