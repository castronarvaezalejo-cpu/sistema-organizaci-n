"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import EmpresaSearchSelect from "@/components/ui/EmpresaSearchSelect";
import { supabase } from "@/lib/supabase";

type Colaborador = {
  id: string;
  nombre: string;
};

type Empresa = {
  id: string;
  nombre: string;
};

type PlaneacionActividad = {
  id: string;
  colaborador_id: string;
  empresa_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  horas_programadas: number;
  actividad: string;
  observaciones?: string | null;
  empresas?: {
    nombre?: string | null;
  } | null;
};

type FormularioPlaneacion = {
  id: string | null;
  colaboradorId: string;
  fecha: string;
  empresaId: string;
  horaInicio: string;
  horaFin: string;
  horasProgramadas: string;
  actividad: string;
  observaciones: string;
};

const nombresDias = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function fechaISO(fecha: Date) {
  return fecha.toISOString().split("T")[0];
}

function inicioSemana(fecha: Date) {
  const copia = new Date(fecha);
  const dia = copia.getDay();
  const diferencia = dia === 0 ? -6 : 1 - dia;
  copia.setDate(copia.getDate() + diferencia);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function sumarDias(fecha: Date, dias: number) {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

function formatearDia(fecha: Date) {
  return fecha.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
}

function formatearSemana(inicio: Date) {
  const fin = sumarDias(inicio, 6);

  return `Semana del ${inicio.toLocaleDateString("es-CO", {
    day: "numeric",
  })} al ${fin.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
  })}`;
}

function calcularHoras(inicio: string, fin: string) {
  if (!inicio || !fin) return "";

  const [horaInicio, minutoInicio] = inicio.split(":").map(Number);
  const [horaFin, minutoFin] = fin.split(":").map(Number);

  const minutosInicio = horaInicio * 60 + minutoInicio;
  const minutosFin = horaFin * 60 + minutoFin;
  const diferencia = minutosFin - minutosInicio;

  if (diferencia <= 0) return "";

  return String(Number((diferencia / 60).toFixed(2)));
}

export default function PlaneacionPage() {
  const [semanaInicio, setSemanaInicio] = useState(
    inicioSemana(new Date())
  );
  const [colaboradores, setColaboradores] = useState<
    Colaborador[]
  >([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [actividades, setActividades] = useState<
    PlaneacionActividad[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] =
    useState<FormularioPlaneacion>({
      id: null,
      colaboradorId: "",
      fecha: "",
      empresaId: "",
      horaInicio: "",
      horaFin: "",
      horasProgramadas: "",
      actividad: "",
      observaciones: "",
    });

  const diasSemana = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        sumarDias(semanaInicio, index)
      ),
    [semanaInicio]
  );

  useEffect(() => {
    cargarDatos();
  }, [semanaInicio]);

  async function cargarDatos() {
    setLoading(true);

    const inicio = fechaISO(semanaInicio);
    const fin = fechaISO(sumarDias(semanaInicio, 6));

    const [
      { data: colaboradoresData },
      { data: empresasData },
      { data: actividadesData },
    ] = await Promise.all([
      supabase
        .from("colaboradores")
        .select("id, nombre")
        .eq("activo", true)
        .order("nombre"),
      supabase
        .from("empresas")
        .select("id, nombre")
        .eq("activa", true)
        .order("nombre"),
      supabase
        .from("planeacion_actividades")
        .select(
          `
          *,
          empresas (
            nombre
          )
        `
        )
        .gte("fecha", inicio)
        .lte("fecha", fin)
        .order("hora_inicio"),
    ]);

    setColaboradores((colaboradoresData || []) as Colaborador[]);
    setEmpresas((empresasData || []) as Empresa[]);
    setActividades(
      (actividadesData || []) as PlaneacionActividad[]
    );
    setLoading(false);
  }

  function actividadesCelda(
    colaboradorId: string,
    fecha: string
  ) {
    return actividades.filter(
      (actividad) =>
        actividad.colaborador_id === colaboradorId &&
        actividad.fecha === fecha
    );
  }

  function totalDia(
    colaboradorId: string,
    fecha: string
  ) {
    return actividadesCelda(colaboradorId, fecha).reduce(
      (total, actividad) =>
        total + Number(actividad.horas_programadas || 0),
      0
    );
  }

  function totalSemana(colaboradorId: string) {
    return actividades
      .filter(
        (actividad) =>
          actividad.colaborador_id === colaboradorId
      )
      .reduce(
        (total, actividad) =>
          total + Number(actividad.horas_programadas || 0),
        0
      );
  }

  function abrirNuevo(colaboradorId: string, fecha: string) {
    setFormulario({
      id: null,
      colaboradorId,
      fecha,
      empresaId: "",
      horaInicio: "",
      horaFin: "",
      horasProgramadas: "",
      actividad: "",
      observaciones: "",
    });
    setModalAbierto(true);
  }

  function abrirEdicion(actividad: PlaneacionActividad) {
    setFormulario({
      id: actividad.id,
      colaboradorId: actividad.colaborador_id,
      fecha: actividad.fecha,
      empresaId: actividad.empresa_id,
      horaInicio: actividad.hora_inicio?.slice(0, 5) || "",
      horaFin: actividad.hora_fin?.slice(0, 5) || "",
      horasProgramadas: String(actividad.horas_programadas),
      actividad: actividad.actividad,
      observaciones: actividad.observaciones || "",
    });
    setModalAbierto(true);
  }

  function actualizarFormulario(
    campo: keyof FormularioPlaneacion,
    valor: string
  ) {
    setFormulario((actual) => {
      const nuevo = {
        ...actual,
        [campo]: valor,
      };

      if (campo === "horaInicio" || campo === "horaFin") {
        const horas = calcularHoras(
          campo === "horaInicio" ? valor : nuevo.horaInicio,
          campo === "horaFin" ? valor : nuevo.horaFin
        );

        if (horas) {
          nuevo.horasProgramadas = horas;
        }
      }

      return nuevo;
    });
  }

  async function guardarPlaneacion() {
    if (
      !formulario.colaboradorId ||
      !formulario.fecha ||
      !formulario.empresaId ||
      !formulario.horaInicio ||
      !formulario.horaFin ||
      !formulario.horasProgramadas ||
      !formulario.actividad
    ) {
      alert("Completa los campos obligatorios.");
      return;
    }

    const payload = {
      colaborador_id: formulario.colaboradorId,
      empresa_id: formulario.empresaId,
      fecha: formulario.fecha,
      hora_inicio: formulario.horaInicio,
      hora_fin: formulario.horaFin,
      horas_programadas: Number(
        formulario.horasProgramadas
      ),
      actividad: formulario.actividad,
      observaciones: formulario.observaciones || null,
      updated_at: new Date().toISOString(),
    };

    const respuesta = formulario.id
      ? await supabase
          .from("planeacion_actividades")
          .update(payload)
          .eq("id", formulario.id)
      : await supabase
          .from("planeacion_actividades")
          .insert(payload);

    if (respuesta.error) {
      console.error(respuesta.error);
      alert("No fue posible guardar la planeación.");
      return;
    }

    setModalAbierto(false);
    cargarDatos();
  }

  async function eliminarPlaneacion() {
    if (!formulario.id) return;

    const confirmar = confirm("¿Eliminar esta actividad planeada?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("planeacion_actividades")
      .delete()
      .eq("id", formulario.id);

    if (error) {
      alert("No fue posible eliminar la actividad.");
      return;
    }

    setModalAbierto(false);
    cargarDatos();
  }

  return (
    <div>
      <PageHeader
        title="Planeación"
        description="Organización semanal del trabajo de los colaboradores."
      />

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <button
          type="button"
          onClick={() =>
            setSemanaInicio((actual) => sumarDias(actual, -7))
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ChevronLeft size={16} />
          Semana anterior
        </button>

        <div className="text-center">
          <p className="text-lg font-black text-slate-800">
            {formatearSemana(semanaInicio)}
          </p>
          <button
            type="button"
            onClick={() => setSemanaInicio(inicioSemana(new Date()))}
            className="mt-1 text-sm font-semibold text-[#0B4A92] hover:underline"
          >
            Hoy
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            setSemanaInicio((actual) => sumarDias(actual, 7))
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B4A92] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0B75C9]"
        >
          Semana siguiente
          <ChevronRight size={16} />
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Cargando planeación...
        </div>
      ) : colaboradores.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          No hay colaboradores activos para planear.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="min-w-[1180px]">
            <div className="grid grid-cols-[180px_repeat(7,minmax(130px,1fr))_110px] border-b border-slate-200 bg-blue-50">
              <div className="p-3 text-xs font-bold uppercase tracking-wide text-slate-600">
                Colaborador
              </div>
              {diasSemana.map((dia, index) => (
                <div
                  key={fechaISO(dia)}
                  className="border-l border-slate-200 p-3 text-center"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                    {nombresDias[index]}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatearDia(dia)}
                  </p>
                </div>
              ))}
              <div className="border-l border-slate-200 p-3 text-center text-xs font-bold uppercase tracking-wide text-slate-600">
                Total semana
              </div>
            </div>

            {colaboradores.map((colaborador) => (
              <div
                key={colaborador.id}
                className="grid grid-cols-[180px_repeat(7,minmax(130px,1fr))_110px] border-b border-slate-100 last:border-b-0"
              >
                <div className="flex items-center p-3">
                  <p className="text-sm font-bold text-slate-800">
                    {colaborador.nombre}
                  </p>
                </div>

                {diasSemana.map((dia) => {
                  const fecha = fechaISO(dia);
                  const actividadesDia = actividadesCelda(
                    colaborador.id,
                    fecha
                  );
                  const horasDia = totalDia(colaborador.id, fecha);
                  const exceso = horasDia > 8;

                  return (
                    <div
                      key={`${colaborador.id}-${fecha}`}
                      className="min-h-40 border-l border-slate-100 p-2"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          abrirNuevo(colaborador.id, fecha)
                        }
                        className="mb-2 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 px-2 py-2 text-xs font-semibold text-slate-500 transition hover:border-[#0B4A92] hover:bg-blue-50 hover:text-[#0B4A92]"
                      >
                        <Plus size={14} />
                        Programar
                      </button>

                      {horasDia > 0 && (
                        <div
                          className={`mb-2 rounded-lg px-2 py-1 text-xs font-bold ${
                            exceso
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {exceso ? "⚠ " : ""}
                          {horasDia} horas
                        </div>
                      )}

                      <div className="space-y-2">
                        {actividadesDia.map((actividad) => (
                          <button
                            key={actividad.id}
                            type="button"
                            onClick={() => abrirEdicion(actividad)}
                            className="w-full rounded-xl border border-blue-100 bg-blue-50 p-2 text-left transition hover:border-[#0B4A92]"
                          >
                            <p className="truncate text-xs font-bold text-[#0B4A92]">
                              {actividad.empresas?.nombre || "Empresa"}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              {actividad.hora_inicio?.slice(0, 5)} -{" "}
                              {actividad.hora_fin?.slice(0, 5)}
                            </p>
                            <p className="text-xs font-semibold text-slate-700">
                              {actividad.horas_programadas} horas
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                              {actividad.actividad}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center justify-center border-l border-slate-200 p-3">
                  <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-800">
                    {totalSemana(colaborador.id)}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-800">
                  {formulario.id
                    ? "Editar actividad"
                    : "Programar actividad"}
                </h2>
                <p className="text-sm text-slate-500">
                  {formulario.fecha}
                </p>
              </div>

              {formulario.id && (
                <button
                  type="button"
                  onClick={eliminarPlaneacion}
                  className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                  aria-label="Eliminar actividad"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <EmpresaSearchSelect
                empresas={empresas}
                value={formulario.empresaId}
                onChange={(id) =>
                  actualizarFormulario("empresaId", id)
                }
                placeholder="Empresa"
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Campo
                  label="Hora inicio"
                  type="time"
                  value={formulario.horaInicio}
                  onChange={(valor) =>
                    actualizarFormulario("horaInicio", valor)
                  }
                />
                <Campo
                  label="Hora fin"
                  type="time"
                  value={formulario.horaFin}
                  onChange={(valor) =>
                    actualizarFormulario("horaFin", valor)
                  }
                />
                <Campo
                  label="Horas"
                  type="number"
                  value={formulario.horasProgramadas}
                  onChange={(valor) =>
                    actualizarFormulario(
                      "horasProgramadas",
                      valor
                    )
                  }
                />
              </div>

              <Campo
                label="Actividad"
                value={formulario.actividad}
                onChange={(valor) =>
                  actualizarFormulario("actividad", valor)
                }
                placeholder="Ej. Actualizar matriz de riesgos"
              />

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-600">
                  Observaciones
                </span>
                <textarea
                  value={formulario.observaciones}
                  onChange={(event) =>
                    actualizarFormulario(
                      "observaciones",
                      event.target.value
                    )
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </label>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarPlaneacion}
                className="flex-1 rounded-xl bg-[#0B4A92] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0B75C9]"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-600">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
      />
    </label>
  );
}
