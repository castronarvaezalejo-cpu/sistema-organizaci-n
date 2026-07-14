"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import { supabase } from "@/lib/supabase";

type Plantilla = {
  id: string;
  tipo: string;
  nombre: string;
  contenido: string;
  predeterminada: boolean;
};

const variables = [
  "{{nombre}}",
  "{{empresa}}",
  "{{cargo}}",
  "{{edad}}",
  "{{fecha}}",
];

export default function PlantillasCumpleanosPage() {
  const [plantillas, setPlantillas] = useState<
    Plantilla[]
  >([]);
  const [editando, setEditando] =
    useState<Plantilla | null>(null);
  const [tipo, setTipo] = useState("WhatsApp");
  const [nombre, setNombre] = useState("");
  const [contenido, setContenido] = useState("");

  useEffect(() => {
    cargarPlantillas();
  }, []);

  async function cargarPlantillas() {
    const { data } = await supabase
      .from("cumpleanos_plantillas")
      .select("*")
      .order("created_at", { ascending: false });

    setPlantillas((data || []) as Plantilla[]);
  }

  function limpiarFormulario() {
    setEditando(null);
    setTipo("WhatsApp");
    setNombre("");
    setContenido("");
  }

  function editar(plantilla: Plantilla) {
    setEditando(plantilla);
    setTipo(plantilla.tipo);
    setNombre(plantilla.nombre);
    setContenido(plantilla.contenido);
  }

  async function guardarPlantilla() {
    if (!nombre.trim() || !contenido.trim()) {
      alert("Completa el nombre y el contenido.");
      return;
    }

    const payload = {
      tipo,
      nombre,
      contenido,
      predeterminada: true,
      updated_at: new Date().toISOString(),
    };

    if (editando) {
      await supabase
        .from("cumpleanos_plantillas")
        .update(payload)
        .eq("id", editando.id);
    } else {
      await supabase
        .from("cumpleanos_plantillas")
        .insert(payload);
    }

    limpiarFormulario();
    cargarPlantillas();
  }

  async function eliminarPlantilla(id: string) {
    const confirmar = confirm("¿Eliminar plantilla?");
    if (!confirmar) return;

    await supabase
      .from("cumpleanos_plantillas")
      .delete()
      .eq("id", id);

    cargarPlantillas();
  }

  return (
    <div>
      <PageHeader
        title="Plantillas de cumpleaños"
        description="Mensajes reutilizables para WhatsApp, correo y alertas internas."
        action={
          <Link
            href="/cumpleanos"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Volver
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-800">
            {editando ? "Editar plantilla" : "Nueva plantilla"}
          </h2>

          <div className="space-y-4">
            <select
              value={tipo}
              onChange={(event) => setTipo(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="WhatsApp">WhatsApp</option>
              <option value="Correo">Correo</option>
              <option value="Interna">Interna</option>
            </select>

            <input
              value={nombre}
              onChange={(event) =>
                setNombre(event.target.value)
              }
              placeholder="Nombre de la plantilla"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <textarea
              value={contenido}
              onChange={(event) =>
                setContenido(event.target.value)
              }
              rows={9}
              placeholder="Mensaje con variables..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              Variables disponibles: {variables.join(", ")}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={limpiarFormulario}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarPlantilla}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0B4A92] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0B75C9]"
              >
                <Plus size={16} />
                Guardar
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-[120px_1fr_90px] border-b border-slate-200 bg-blue-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Tipo</span>
            <span>Plantilla</span>
            <span className="text-right">Acción</span>
          </div>

          {plantillas.length === 0 ? (
            <div className="p-5 text-sm text-slate-500">
              No hay plantillas registradas.
            </div>
          ) : (
            plantillas.map((plantilla) => (
              <div
                key={plantilla.id}
                className="grid grid-cols-[120px_1fr_90px] items-center border-b border-slate-100 px-4 py-3 last:border-b-0"
              >
                <span className="text-sm font-semibold text-[#0B4A92]">
                  {plantilla.tipo}
                </span>
                <button
                  type="button"
                  onClick={() => editar(plantilla)}
                  className="min-w-0 text-left"
                >
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {plantilla.nombre}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {plantilla.contenido}
                  </p>
                </button>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      eliminarPlantilla(plantilla.id)
                    }
                    className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                    aria-label="Eliminar plantilla"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
