"use client";

import {
  use,
  useEffect,
  useState,
} from "react";

import { useRouter }
from "next/navigation";

import { supabase }
from "@/lib/supabase";

export default function EditarExtintorPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {

  const { id } = use(params);

  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    codigo,
    setCodigo,
  ] = useState("");

const [
  empresaId,
  setEmpresaId,
] = useState("");

const [
  empresaNombre,
  setEmpresaNombre,
] = useState("");

const [
  empresas,
  setEmpresas,
] = useState<any[]>([]);

const [
  responsableId,
  setResponsableId,
] = useState("");

const [
  colaboradores,
  setColaboradores,
] = useState<any[]>([]);

  const [
    ubicacion,
    setUbicacion,
  ] = useState("");

  const [
    tipo,
    setTipo,
  ] = useState("");

  const [
    capacidad,
    setCapacidad,
  ] = useState("");

  const [
    fechaRecarga,
    setFechaRecarga,
  ] = useState("");
  

useEffect(() => {

  cargarEmpresas();

  cargarColaboradores();

  cargarExtintor();

}, []);

async function cargarEmpresas() {

  const { data } = await supabase
    .from("empresas")
    .select("id, nombre")
    .eq("activa", true)
    .order("nombre");

  if (data) {

    setEmpresas(data);

  }

}

async function cargarColaboradores() {

  const { data } = await supabase
    .from("colaboradores")
    .select("id, nombre")
    .order("nombre");

  if (data) {

    setColaboradores(data);

  }

}

  async function cargarExtintor() {

const {
  data,
  error,
} = await supabase
  .from("extintores")
  .select(`
    *,
    empresas (
      nombre
    )
  `)
  .eq("id", id)
  .single();

    if (error || !data) {

      alert(
        "Error cargando extintor"
      );

router.back();

      return;
    }

  setCodigo(
  data.codigo || ""
);

setEmpresaId(
  data.empresa_id || ""
);

setEmpresaNombre(
  data.empresas?.nombre || ""
);

setResponsableId(
  data.responsable_calendario === "todos"
    ? "todos"
    : data.responsable_id || ""
);

setUbicacion(
  data.ubicacion || ""
);

    setTipo(
      data.tipo || ""
    );

    setCapacidad(
      data.capacidad || ""
    );

    setFechaRecarga(
      data.fecha_recarga || ""
    );

    setLoading(false);
  }

async function crearEventoGoogleCalendar() {

  if (!responsableId) return null;

const empresaSeleccionada =
  empresas.find(
    (empresa) =>
      empresa.id === empresaId
  );

const {
  data: { session },
} = await supabase.auth.getSession();

if (!session) return null;

const [anio, mes, dia] = fechaRecarga
  .split("-")
  .map(Number);

const fechaVencimiento = new Date(
  anio,
  mes - 1,
  dia
);;

fechaVencimiento.setFullYear(
  fechaVencimiento.getFullYear() + 1
);

const respuesta = await fetch(
  "/api/google-calendar/event",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      colaboradorId: responsableId,
      title: `🧯 Recarga Extintor ${codigo}`,
      description:
`Empresa: ${empresaSeleccionada?.nombre}

Ubicación: ${ubicacion}

Tipo: ${tipo}

Capacidad: ${capacidad}`,
      date:
        fechaVencimiento
          .toISOString()
          .split("T")[0],
    }),
  }
);

const google =
  await respuesta.json();

return google;

}

async function crearEventosGoogleCalendarExtintor() {

  if (!responsableId) return null;

  const empresaSeleccionada =
    empresas.find(
      (empresa) =>
        empresa.id === empresaId
    );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const [anio, mes, dia] = fechaRecarga
    .split("-")
    .map(Number);

  const fechaVencimiento = new Date(
    anio,
    mes - 1,
    dia
  );

  fechaVencimiento.setFullYear(
    fechaVencimiento.getFullYear() + 1
  );

  const responsablesCalendario =
    responsableId === "todos"
      ? colaboradores.map((colaborador) => colaborador.id)
      : [responsableId];

  const eventos = [];

  for (const colaboradorId of responsablesCalendario) {
    const respuesta = await fetch(
      "/api/google-calendar/event",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          colaboradorId,
          title: `🧯 Recarga Extintor ${codigo}`,
          description:
`Empresa: ${empresaSeleccionada?.nombre}

Ubicación: ${ubicacion}

Tipo: ${tipo}

Capacidad: ${capacidad}`,
          date:
            fechaVencimiento
              .toISOString()
              .split("T")[0],
        }),
      }
    );

    const google = await respuesta.json();

    if (google?.eventId) {
      eventos.push({
        colaborador_id: colaboradorId,
        event_id: google.eventId,
      });
    }
  }

  return {
    eventId: eventos[0]?.event_id || null,
    eventIds: eventos,
  };
}

async function actualizarEventoGoogleCalendar(
  eventId: string
) {

  if (!responsableId) return;

  const empresaSeleccionada =
    empresas.find(
      (empresa) =>
        empresa.id === empresaId
    );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return;

 const [anio, mes, dia] = fechaRecarga
  .split("-")
  .map(Number);

const fechaVencimiento = new Date(
  anio,
  mes - 1,
  dia
);;

  fechaVencimiento.setFullYear(
    fechaVencimiento.getFullYear() + 1
  );

  await fetch(
    "/api/google-calendar/event",
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId,
        colaboradorId: responsableId,
        title: `🧯 Recarga Extintor ${codigo}`,
        description:
`Empresa: ${empresaSeleccionada?.nombre}

Ubicación: ${ubicacion}

Tipo: ${tipo}

Capacidad: ${capacidad}`,
        date:
          fechaVencimiento
            .toISOString()
            .split("T")[0],
      }),
    }
  );

}

async function eliminarEventoGoogleCalendar(
  eventId: string,
  colaboradorId: string
) {

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return;

const respuesta = await fetch(
  "/api/google-calendar/event/delete",
  {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventId,
      colaboradorId,
    }),
  }
);

console.log(
  "ELIMINAR EVENTO GOOGLE:",
  await respuesta.text()
);;

}

async function actualizarExtintor(
  e: React.FormEvent
) {

  e.preventDefault();

  const {
    data: extintorActual,
    error,
  } = await supabase
    .from("extintores")
    .select("google_calendar_event_id,responsable_id,responsable_calendario,google_calendar_event_ids")
    .eq("id", id)
    .single();

  if (error || !extintorActual) {
    alert("No se pudo cargar el extintor.");
    return;
  }

  let googleEventId =
    extintorActual.google_calendar_event_id;

  let googleEventIds =
    extintorActual.google_calendar_event_ids || [];

  // ===============================
  // MISMO RESPONSABLE
  // ===============================

  if (
    extintorActual.responsable_id === responsableId
  ) {

    if (googleEventId) {

      await actualizarEventoGoogleCalendar(
        googleEventId
      );

    }

  }

  // ===============================
  // CAMBIÓ EL RESPONSABLE
  // ===============================

  else {

    if (
      googleEventId &&
      extintorActual.responsable_id
    ) {

      await eliminarEventoGoogleCalendar(
        googleEventId,
        extintorActual.responsable_id
      );

    }

    if (Array.isArray(extintorActual.google_calendar_event_ids)) {
      for (const evento of extintorActual.google_calendar_event_ids) {
        if (evento?.event_id && evento?.colaborador_id) {
          await eliminarEventoGoogleCalendar(
            evento.event_id,
            evento.colaborador_id
          );
        }
      }
    }

    const google =
      await crearEventosGoogleCalendarExtintor();

    googleEventId =
      google?.eventId ?? null;

    googleEventIds =
      google?.eventIds || [];

  }

  const { error: updateError } =
    await supabase
      .from("extintores")
      .update({

        codigo,

        empresa_id: empresaId,

        responsable_id:
          responsableId === "todos"
            ? null
            : responsableId,

        responsable_calendario:
          responsableId === "todos"
            ? "todos"
            : responsableId,

        ubicacion,

        tipo,

        capacidad,

        fecha_recarga: fechaRecarga,

        google_calendar_event_id:
          googleEventId,

        google_calendar_event_ids:
          googleEventIds,

      })
      .eq("id", id);

  if (updateError) {

    alert("Error actualizando.");

    return;

  }

router.push(`/extintores?empresa=${empresaId}`);

  router.refresh();

}

  if (loading) {

    return (

      <div className="
        p-5
      ">

        Cargando...

      </div>
    );
  }

  return (

    <div className="
      max-w-3xl
    ">

      <h1 className="
        text-3xl
        font-bold
        mb-8
      ">

        Editar Extintor

      </h1>

      <form
        onSubmit={
          actualizarExtintor
        }
        className="
          bg-white
          border
          border-slate-200
          rounded-2xl
          p-5
          space-y-5
        "
      >

        <Input
          label="Código"
          value={codigo}
          onChange={
            setCodigo
          }
        />

<div className="space-y-2">

  <label className="text-sm text-slate-500">
    Empresa
  </label>

  <select
    value={empresaId}
    onChange={(e) =>
      setEmpresaId(e.target.value)
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
      focus:border-blue-500
    "
  >

    <option value="">
      Seleccione una empresa
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

</div>

<div className="space-y-2">

  <label className="text-sm text-slate-500">
    Responsable del calendario
  </label>

  <select
    value={responsableId}
    onChange={(e) =>
      setResponsableId(e.target.value)
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
      focus:border-blue-500
    "
  >

    <option value="">
      Seleccione un responsable
    </option>

    <option value="todos">
      Todos
    </option>

    {colaboradores.map((colaborador) => (

      <option
        key={colaborador.id}
        value={colaborador.id}
      >

        {colaborador.nombre}

      </option>

    ))}

  </select>

</div>

        <Input
          label="Ubicación"
          value={ubicacion}
          onChange={
            setUbicacion
          }
        />

        <Input
          label="Tipo"
          value={tipo}
          onChange={
            setTipo
          }
        />

        <Input
          label="Capacidad"
          value={capacidad}
          onChange={
            setCapacidad
          }
        />

        <DateInput
          label="
            Fecha de recarga
          "
          value={
            fechaRecarga
          }
          onChange={
            setFechaRecarga
          }
        />

        <div className="
          flex
          gap-4
          pt-4
        ">

          <button
            type="submit"
            className="
              bg-blue-600
              hover:bg-blue-700
              transition
              px-5
              py-3
              rounded-xl
              font-semibold
            "
          >

            Guardar Cambios

          </button>

          <button
            type="button"
           onClick={() =>
  router.push(
    `/extintores?empresa=${empresaId}`
  )
}
            className="
              bg-white
              hover:bg-slate-100
              transition
              px-5
              py-3
              rounded-xl
              font-semibold
            "
          >

            Cancelar

          </button>

        </div>

      </form>

    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {

  return (

    <div className="
      space-y-2
    ">

      <label className="
        text-sm
        text-slate-500
      ">

        {label}

      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(
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
          focus:border-blue-500
        "
      />

    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {

  return (

    <div className="
      space-y-2
    ">

      <label className="
        text-sm
        text-slate-500
      ">

        {label}

      </label>

      <input
        type="date"
        value={value}
        onChange={(e) =>
          onChange(
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
          focus:border-blue-500
        "
      />

    </div>
  );
}
