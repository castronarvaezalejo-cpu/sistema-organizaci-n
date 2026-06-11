"use client";

import {
  use,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function EditarExtintorPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {

  const { id } = use(params);

  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [codigo, setCodigo] =
    useState("");

  const [empresa, setEmpresa] =
    useState("");

  const [ubicacion, setUbicacion] =
    useState("");

  const [tipo, setTipo] =
    useState("");

  const [capacidad, setCapacidad] =
    useState("");

  const [fechaRecarga,
    setFechaRecarga] = useState("");

  const [fechaHidrostatica,
    setFechaHidrostatica] =
    useState("");

  useEffect(() => {

    cargarExtintor();

  }, []);

  async function cargarExtintor() {

    const { data, error } =
      await supabase
        .from("extintores")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {

      alert(
        "Error cargando extintor"
      );

      router.push("/extintores");

      return;
    }

    setCodigo(data.codigo || "");

    setEmpresa(data.empresa || "");

    setUbicacion(
      data.ubicacion || ""
    );

    setTipo(data.tipo || "");

    setCapacidad(
      data.capacidad || ""
    );

    setFechaRecarga(
      data.fecha_recarga || ""
    );

    setFechaHidrostatica(
      data.fecha_hidrostatica || ""
    );

    setLoading(false);
  }

  async function actualizarExtintor(
    e: React.FormEvent
  ) {

    e.preventDefault();

    const { error } =
      await supabase
        .from("extintores")
        .update({
          codigo,
          empresa,
          ubicacion,
          tipo,
          capacidad,
          fecha_recarga:
            fechaRecarga,
          fecha_hidrostatica:
            fechaHidrostatica,
        })
        .eq("id", id);

    if (error) {

      alert(
        "Error actualizando"
      );

      return;
    }

    router.push("/extintores");

    router.refresh();
  }

  if (loading) {

    return (
      <div className="p-6">
        Cargando...
      </div>
    );
  }

  return (

    <div className="max-w-3xl">

      <h1 className="
        text-3xl
        font-bold
        mb-8
      ">
        Editar Extintor
      </h1>

      <form
        onSubmit={actualizarExtintor}
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

        <Input
          label="Empresa"
          value={empresa}
          onChange={setEmpresa}
        />

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

        <DateInput
          label="Fecha hidrostática"
          value={fechaHidrostatica}
          onChange={
            setFechaHidrostatica
          }
        />

        <button
          type="submit"
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

          Guardar Cambios

        </button>

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