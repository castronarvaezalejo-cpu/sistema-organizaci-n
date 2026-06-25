  "use client";

  import { useEffect, useState } from "react";

  import { useRouter } from "next/navigation";

  import { supabase } from "@/lib/supabase";

  

  export default function NuevoExtintorPage() {

    const router = useRouter();

    const [codigo, setCodigo] =
      useState("");

  const [empresaId, setEmpresaId] =
    useState("");

  const [empresas, setEmpresas] =
    useState<any[]>([]);

    const [responsableId, setResponsableId] =
  useState("");

const [colaboradores, setColaboradores] =
  useState<any[]>([]);

    const [ubicacion, setUbicacion] =
      useState("");

    const [tipo, setTipo] =
      useState("");

    const [capacidad, setCapacidad] =
      useState("");

    const [fechaRecarga,
      setFechaRecarga] = useState("");


    const [loading, setLoading] =
      useState(false);

useEffect(() => {
  cargarEmpresas();
  cargarColaboradores();
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

async function crearEventoGoogleCalendar() {

  if (!responsableId) {

  alert("Selecciona un responsable del calendario.");

  return null;

}

  const empresaSeleccionada =
    empresas.find(
      (empresa) =>
        empresa.id === empresaId
    );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  // La fecha de vencimiento es un año después de la recarga

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

  const respuesta =
    await fetch(
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

  return await respuesta.json();

}

    async function crearExtintor(
      e: React.FormEvent
    ) {

      e.preventDefault();

      setLoading(true);

 const google =
  await crearEventoGoogleCalendar();

const googleEventId =
  google?.eventId || null;

const { error } =
  await supabase
    .from("extintores")
    .insert([
{
  codigo,
  empresa_id: empresaId,
  responsable_id: responsableId,
  ubicacion,
  tipo,
  capacidad,
  fecha_recarga: fechaRecarga,
  google_calendar_event_id: googleEventId,
},
    ]);

      setLoading(false);

      if (error) {

        console.log(error);

        alert(
          "Error creando extintor"
        );

        return;
      }

      router.back();

      router.refresh();
    }

    return (

      <div className="max-w-3xl">

        <h1 className="
          text-3xl
          font-bold
          mb-8
        ">
          Nuevo Extintor
        </h1>

        <form
          onSubmit={crearExtintor}
          className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-2xl
            p-8
            space-y-6
          "
        >

          <Input
            label="Código"
            value={codigo}
            onChange={setCodigo}
          />

          <div className="space-y-2">

    <label className="text-sm text-zinc-400">
      Empresa
    </label>

    <select
      value={empresaId}
      onChange={(e) =>
        setEmpresaId(e.target.value)
      }
      className="
        w-full
        bg-black
        border
        border-zinc-800
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

  <label className="text-sm text-zinc-400">
    Responsable del calendario
  </label>

  <select
    value={responsableId}
    onChange={(e) =>
      setResponsableId(e.target.value)
    }
    className="
      w-full
      bg-black
      border
      border-zinc-800
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
            onChange={setUbicacion}
          />

          <Input
            label="Tipo"
            value={tipo}
            onChange={setTipo}
          />

          <Input
            label="Capacidad"
            value={capacidad}
            onChange={setCapacidad}
          />

          <DateInput
            label="Fecha de recarga"
            value={fechaRecarga}
            onChange={setFechaRecarga}
          />


          <div className="flex gap-4">

  <button
    type="submit"
    disabled={loading}
    className="
      bg-blue-600
      hover:bg-blue-700
      transition
      px-6
      py-3
      rounded-xl
      font-semibold
    "
  >
    {loading
      ? "Guardando..."
      : "Guardar Extintor"}
  </button>

  <button
    type="button"
    onClick={() =>
  router.push(`/extintores?empresa=${empresaId}`)
}
    className="
      bg-zinc-700
      hover:bg-zinc-600
      transition
      px-6
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
    onChange: (value: string) => void;
  }) {

    return (

      <div className="space-y-2">

        <label className="
          text-sm
          text-zinc-400
        ">
          {label}
        </label>

        <input
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="
            w-full
            bg-black
            border
            border-zinc-800
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
    onChange: (value: string) => void;
  }) {

    return (

      <div className="space-y-2">

        <label className="
          text-sm
          text-zinc-400
        ">
          {label}
        </label>

        <input
          type="date"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="
            w-full
            bg-black
            border
            border-zinc-800
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