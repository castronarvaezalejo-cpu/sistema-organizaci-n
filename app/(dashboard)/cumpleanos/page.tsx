"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Cake,
  Mail,
  MessageCircle,
  Settings,
} from "lucide-react";

import PageHeader from "@/components/ui/PageHeader";
import { supabase } from "@/lib/supabase";
import {
  aplicarPlantillaCumpleanos,
  obtenerInfoCumpleanos,
  plantillaCumpleanosDefault,
  TrabajadorCumpleanos,
} from "@/lib/cumpleanos";
import TrabajadorAvatar from "@/components/ui/trabajadores/TrabajadorAvatar";

type Plantilla = {
  tipo: string;
  contenido: string;
};

type CumpleanosItem = {
  trabajador: TrabajadorCumpleanos;
  info: NonNullable<
    ReturnType<typeof obtenerInfoCumpleanos>
  >;
};

export default function CumpleanosPage() {
  const [trabajadores, setTrabajadores] = useState<
    TrabajadorCumpleanos[]
  >([]);
  const [plantillas, setPlantillas] = useState<
    Plantilla[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCumpleanos();
  }, []);

  async function cargarCumpleanos() {
    setLoading(true);

    const { data } = await supabase
      .from("trabajadores_empresa")
      .select(
        "id, empresa_id, nombre, cargo, correo, telefono, fecha_nacimiento, foto_url, empresas(nombre)"
      )
      .not("fecha_nacimiento", "is", null)
      .order("nombre");

    const { data: plantillasData } = await supabase
      .from("cumpleanos_plantillas")
      .select("tipo, contenido")
      .eq("predeterminada", true);

    setTrabajadores((data || []) as TrabajadorCumpleanos[]);
    setPlantillas((plantillasData || []) as Plantilla[]);
    setLoading(false);
  }

  const items = useMemo(() => {
    return trabajadores
      .map((trabajador) => {
        const info = obtenerInfoCumpleanos(
          trabajador.fecha_nacimiento
        );

        if (!info) return null;

        return { trabajador, info };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          a!.info.diasRestantes -
          b!.info.diasRestantes
      ) as CumpleanosItem[];
  }, [trabajadores]);

  const hoy = items.filter((item) => item.info.esHoy);
  const semana = items.filter(
    (item) => item.info.esEstaSemana
  );
  const mes = items.filter((item) => item.info.esEsteMes);
  const proximo = items[0];

  async function registrarHistorial(
    item: CumpleanosItem,
    tipo: "WhatsApp" | "Correo",
    mensaje: string
  ) {
    await supabase.from("cumpleanos_historial").insert({
      trabajador_id: item.trabajador.id,
      empresa_id: item.trabajador.empresa_id,
      tipo,
      estado: "Enviado",
      mensaje,
    });
  }

  function plantillaPorTipo(tipo: string) {
    return (
      plantillas.find((plantilla) => plantilla.tipo === tipo)
        ?.contenido || plantillaCumpleanosDefault
    );
  }

  async function enviarWhatsApp(item: CumpleanosItem) {
    if (!item.trabajador.telefono) {
      alert("Este trabajador no tiene teléfono registrado.");
      return;
    }

    const mensaje = aplicarPlantillaCumpleanos(
      plantillaPorTipo("WhatsApp"),
      item.trabajador,
      item.info
    );

    await registrarHistorial(item, "WhatsApp", mensaje);

    const telefono = item.trabajador.telefono.replace(
      /\D/g,
      ""
    );

    window.open(
      `https://wa.me/57${telefono}?text=${encodeURIComponent(
        mensaje
      )}`,
      "_blank"
    );
  }

  async function enviarCorreo(item: CumpleanosItem) {
    if (!item.trabajador.correo) {
      alert("Este trabajador no tiene correo registrado.");
      return;
    }

    const mensaje = aplicarPlantillaCumpleanos(
      plantillaPorTipo("Correo"),
      item.trabajador,
      item.info
    );

    await registrarHistorial(item, "Correo", mensaje);

    window.location.href = `mailto:${
      item.trabajador.correo
    }?subject=${encodeURIComponent(
      "Feliz cumpleaños"
    )}&body=${encodeURIComponent(mensaje)}`;
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Cargando cumpleaños...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Cumpleaños"
        description="Recordatorios automáticos de cumpleaños de trabajadores."
        action={
          <Link
            href="/cumpleanos/plantillas"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Settings size={16} />
            Plantillas
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ResumenCard title="Hoy" value={hoy.length} />
        <ResumenCard
          title="Esta semana"
          value={semana.length}
        />
        <ResumenCard title="Este mes" value={mes.length} />
        <ResumenCard
          title="Próximo"
          value={
            proximo
              ? proximo.info.fechaTexto
              : "Sin datos"
          }
        />
      </div>

      <Seccion
        title="Cumpleaños de hoy"
        items={hoy}
        onWhatsApp={enviarWhatsApp}
        onCorreo={enviarCorreo}
      />

      <Seccion
        title="Cumpleaños de esta semana"
        items={semana}
        onWhatsApp={enviarWhatsApp}
        onCorreo={enviarCorreo}
      />

      <Seccion
        title="Cumpleaños del mes"
        items={mes}
        onWhatsApp={enviarWhatsApp}
        onCorreo={enviarCorreo}
      />
    </div>
  );
}

function ResumenCard({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0B4A92]">
        <Cake size={18} />
      </div>
      <p className="text-xs font-medium text-slate-500">
        {title}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function Seccion({
  title,
  items,
  onWhatsApp,
  onCorreo,
}: {
  title: string;
  items: CumpleanosItem[];
  onWhatsApp: (item: CumpleanosItem) => void;
  onCorreo: (item: CumpleanosItem) => void;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-bold text-slate-800">
        {title}
      </h2>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          No hay cumpleaños en esta sección.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div
              key={`${title}-${item.trabajador.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <TrabajadorAvatar
                  nombre={item.trabajador.nombre}
                  fotoUrl={item.trabajador.foto_url}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {item.trabajador.nombre}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {item.trabajador.empresas?.nombre || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">
                  Cumple {item.info.edad} años
                </p>
                <p className="text-xs text-slate-500">
                  {item.info.fechaTexto} ·{" "}
                  {item.trabajador.cargo || "Sin cargo"}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => onWhatsApp(item)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0B4A92] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0B75C9]"
                >
                  <MessageCircle size={15} />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => onCorreo(item)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Mail size={15} />
                  Correo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
