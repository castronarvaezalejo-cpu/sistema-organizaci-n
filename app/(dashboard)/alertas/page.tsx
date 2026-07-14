"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import { supabase }
from "@/lib/supabase";

import PageHeader
from "@/components/ui/PageHeader";

import { obtenerInfoCumpleanos }
from "@/lib/cumpleanos";



type Alerta = {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  color: string;

  telefono?: string;
  empresa?: string;
};

function calcularEstadoExtintor(
  fechaRecarga: string
) {

  const hoy = new Date();

  const vencimiento =
    new Date(fechaRecarga);

  // +1 año

  vencimiento.setFullYear(
    vencimiento.getFullYear() + 1
  );

  const diferencia =
    vencimiento.getTime() -
    hoy.getTime();

  const dias =
    Math.ceil(
      diferencia /
      (1000 * 60 * 60 * 24)
    );

  // VENCIDO

  if (dias < 0) {

    return {
      tipo: "vencido",
      texto:
        `Vencido hace ${Math.abs(dias)} días`,
      color:
        "border-red-200 bg-red-50 text-red-700",
    };
  }

  // PRÓXIMO

  if (dias <= 30) {

    return {
      tipo: "proximo",
      texto:
        `Vence en ${dias} días`,
      color:
        "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return null;
}

export default function AlertasPage() {

  const [
    alertas,
    setAlertas,
  ] = useState<
    Alerta[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [estadisticas, setEstadisticas] = useState({
  vencidas: 0,
  hoy: 0,
  proximas: 0,
  extintores: 0,
});

  const [filtroResumen, setFiltroResumen] = useState(
    "todas"
  );

  useEffect(() => {

    const filtroUrl =
      new URLSearchParams(
        window.location.search
      ).get("filtro");

    let frame: number | undefined;

    if (
      filtroUrl === "vencidas" ||
      filtroUrl === "hoy" ||
      filtroUrl === "proximas" ||
      filtroUrl === "extintores"
    ) {
      frame = window.requestAnimationFrame(() => {
        setFiltroResumen(filtroUrl);
      });
    }

    obtenerAlertas();

    return () => {
      if (frame !== undefined) {
        window.cancelAnimationFrame(frame);
      }
    };

  }, []);

  // ===================================
  // WHATSAPP
  // ===================================

  function abrirWhatsApp(
    alerta: Alerta
  ) {

    if (!alerta.telefono) {

      alert(
  "Esta empresa no tiene registrado un teléfono del administrador ni un teléfono principal."
);

      return;
    }

    const telefono =
      alerta.telefono.replace(
        /\D/g,
        ""
      );

    const mensaje =
`Hola 

Te contactamos desde SEITON.

Alerta:
${alerta.titulo}

${alerta.descripcion}

Por favor programar revisión o mantenimiento.

SEITON`;

    const url =
`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(
      url,
      "_blank"
    );
  }

  // ===================================
  // OBTENER ALERTAS
  // ===================================

  async function obtenerAlertas() {

    setLoading(true);

    const resultado:
      Alerta[] = [];

    // ===================================
    // TAREAS
    // ===================================

    const hoy =
      new Date();

    const {
      data: tareas,
    } = await supabase
      .from("tareas")
      .select(`
        *,
        empresas (
          nombre,
          telefono
        ),
        colaboradores (
          nombre
        )
      `)
      .neq(
        "estado",
        "completada"
      )
      .order(
        "fecha_limite",
        {
          ascending: true,
        }
      );

    if (tareas) {

      tareas.forEach(
        (tarea: any) => {

        const fecha =
          new Date(
            tarea.fecha_limite
          );

        let tipo =
          "proxima";

        let color =
          "border-blue-200 bg-blue-50 text-blue-700";

        let descripcion =
          "Próxima";

        // VENCIDA

        if (fecha < hoy) {

          tipo =
            "vencida";

          color =
            "border-red-200 bg-red-50 text-red-700";

          descripcion =
            "Tarea vencida";
        }

        // HOY

        else if (
          fecha.toDateString() ===
          hoy.toDateString()
        ) {

          tipo = "hoy";

          color =
            "border-amber-200 bg-amber-50 text-amber-700";

          descripcion =
            "Vence hoy";
        }

        resultado.push({

          id:
            "tarea-" +
            tarea.id,

          tipo,

          titulo:
            tarea.titulo,

          descripcion:
            `${descripcion} • ${tarea.empresas?.nombre || "-"}`,

          fecha:
            tarea.fecha_limite,

          color,

          telefono:
            tarea.empresas?.telefono,

          empresa:
            tarea.empresas?.nombre,
        });
      });
    }

    // ===================================
    // EXTINTORES
    // ===================================

 const {
  data: extintores,
} = await supabase
  .from("extintores")
  .select(`
    *,
    empresas (
      nombre,
      telefono,
      administrador_nombre,
      administrador_telefono
    )
  `);

    if (extintores) {

      extintores.forEach(
        (
          extintor: any
        ) => {

        const estado =
          calcularEstadoExtintor(
            extintor.fecha_recarga
          );

        // SOLO MOSTRAR
        // próximos o vencidos

        if (!estado) return;

        resultado.push({

          id:
            "extintor-" +
            extintor.id,

          tipo:
            estado.tipo,

          titulo:
            `Extintor ${extintor.codigo || "Sin codigo"}`,

          descripcion:
            `${estado.texto} • ${extintor.empresas?.nombre || "Sin empresa"}`,

          fecha:
            extintor.fecha_recarga,

          color:
            estado.color,

          telefono:
  extintor.empresas?.administrador_telefono ||
  extintor.empresas?.telefono,

          empresa:
            extintor.empresas?.nombre,
        });
      });
    }

    // ===================================
    // CUMPLEAÑOS
    // ===================================

    const {
      data: trabajadoresCumpleanos,
    } = await supabase
      .from("trabajadores_empresa")
      .select(`
        id,
        nombre,
        cargo,
        fecha_nacimiento,
        empresas (
          nombre
        )
      `)
      .not("fecha_nacimiento", "is", null);

    if (trabajadoresCumpleanos) {
      trabajadoresCumpleanos.forEach((trabajador: any) => {
        const info = obtenerInfoCumpleanos(
          trabajador.fecha_nacimiento,
          hoy
        );

        if (!info?.esHoy) return;

        resultado.push({
          id: `cumpleanos-${trabajador.id}`,
          tipo: "hoy",
          titulo: `Cumpleaños: ${trabajador.nombre}`,
          descripcion:
            `Hoy cumple ${info.edad} años • ${trabajador.empresas?.nombre || "Sin empresa"}`,
          fecha:
            new Date()
              .toISOString()
              .split("T")[0],
          color:
            "border-blue-200 bg-blue-50 text-blue-700",
          empresa:
            trabajador.empresas?.nombre,
        });
      });
    }

    // ===================================
    // ORDENAR
    // ===================================

    resultado.sort(
      (a, b) =>
        new Date(
          a.fecha
        ).getTime() -
        new Date(
          b.fecha
        ).getTime()
    );

const estadisticas = {
  vencidas: resultado.filter(
    (a) => a.tipo === "vencida" || a.tipo === "vencido"
  ).length,

  hoy: resultado.filter(
    (a) => a.tipo === "hoy"
  ).length,

  proximas: resultado.filter(
    (a) => a.tipo === "proxima" || a.tipo === "proximo"
  ).length,

  extintores: resultado.filter(
    (a) =>
      a.id.startsWith("extintor-")
  ).length,
};

setEstadisticas(estadisticas);

    setAlertas(
      resultado
    );

    setLoading(false);
  }

  // ===================================
  // LOADING
  // ===================================

  if (loading) {

    return (
      <div className="
        p-10
        text-center
      ">
        Cargando alertas...
      </div>
    );
  }

  const alertasFiltradas = alertas.filter(
    (alerta) => {
      if (filtroResumen === "vencidas") {
        return alerta.tipo === "vencida" || alerta.tipo === "vencido";
      }

      if (filtroResumen === "hoy") {
        return alerta.tipo === "hoy";
      }

      if (filtroResumen === "proximas") {
        return alerta.tipo === "proxima" || alerta.tipo === "proximo";
      }

      if (filtroResumen === "extintores") {
        return alerta.id.startsWith("extintor-");
      }

      return true;
    }
  );

  function seleccionarResumen(
    filtro: "vencidas" | "hoy" | "proximas" | "extintores"
  ) {
    setFiltroResumen(filtro);

    requestAnimationFrame(() => {
      document
        .getElementById("lista-alertas")
        ?.scrollIntoView({ behavior: "smooth" });
    });
  }

  return (

    <div>

      <PageHeader
        title="Alertas"
        description={`Seguimiento automático de tareas y extintores · ${alertas.length} alertas activas`}
      />

      {/* HEADER */}

      <div className="
        hidden
      ">

        <h1 className="
          text-4xl
          font-bold
          mb-2
        ">
          Alertas
        </h1>

        <p className="
          text-slate-500
        ">

          Seguimiento automático
          de tareas y extintores

        </p>

        <p className="
          text-slate-500
          text-sm
          mt-3
        ">

          Total:
          {" "}
          {alertas.length}
          {" "}
          alertas activas

        </p>

      </div>

{/* RESUMEN */}

<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  xl:grid-cols-4
  gap-4
  mb-8
">
  <AlertSummaryCard
    title="Urgente"
    value={estadisticas.vencidas}
    subtitle="tareas vencidas"
    color="red"
    icon={<AlertTriangle size={22} />}
    onClick={() => seleccionarResumen("vencidas")}
  />

  <AlertSummaryCard
    title="Vencen hoy"
    value={estadisticas.hoy}
    subtitle="requieren atención"
    color="yellow"
    icon={<CalendarDays size={22} />}
    onClick={() => seleccionarResumen("hoy")}
  />

  <AlertSummaryCard
    title="Próximas"
    value={estadisticas.proximas}
    subtitle="alertas programadas"
    color="blue"
    icon={<Clock3 size={22} />}
    onClick={() => seleccionarResumen("proximas")}
  />

  <AlertSummaryCard
    title="Extintores"
    value={estadisticas.extintores}
    subtitle="por revisar"
    color="green"
    icon={<ShieldCheck size={22} />}
    onClick={() => seleccionarResumen("extintores")}
  />
</div>

      {/* VACÍO */}

      {alertas.length === 0 && (

        <div className="
          bg-white
          border
          border-slate-200
          rounded-2xl
          p-10
          text-center
        ">

          <h2 className="
            text-2xl
            font-bold
            mb-2
          ">

            Todo está al día ✅

          </h2>

          <p className="
          text-slate-500
          ">

            No hay tareas
            ni extintores críticos

          </p>

        </div>
      )}

      {/* ALERTAS */}

      <div
        id="lista-alertas"
        className="
        space-y-5
      ">

        {filtroResumen !== "todas" && (
          <button
            onClick={() => setFiltroResumen("todas")}
            className="
              text-sm
              text-slate-500
              hover:text-blue-700
              transition
            "
          >
            Mostrar todas las alertas
          </button>
        )}

        {alertasFiltradas.map(
          (alerta) => (

          <div
            key={alerta.id}
            className={`
              border
              rounded-2xl
              p-5
              transition
              ${alerta.color}
            `}
          >

            <div className="
              flex
              flex-col
              lg:flex-row
              lg:items-start
              lg:justify-between
              gap-5
            ">

              {/* INFO */}

              <div>

                <h2 className="
                  text-xl
                  font-semibold
                  mb-2
                  text-slate-800
                ">

                  {alerta.titulo}

                </h2>

                <p className="
                  text-slate-600
                  mb-3
                ">

                  {
                    alerta.descripcion
                  }

                </p>

                <p className="
                  text-sm
                  text-slate-500
                ">

                  {
                    alerta.fecha
                  }

                </p>

              </div>

              {/* ACCIONES */}

              <div className="
                flex
                items-center
                gap-3
              ">

                <button
                  onClick={() =>
                    abrirWhatsApp(
                      alerta
                    )
                  }
               className="
  flex
  items-center
  gap-2
  bg-green-600
  hover:bg-green-700
  text-white
  transition
  px-4
  py-3
  rounded-xl
  font-medium
"
                >

                  <MessageCircle
                    size={18}
                  />

                  WhatsApp

                </button>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

function AlertSummaryCard({
  title,
  value,
  subtitle,
  color,
  icon,
  onClick,
}: {
  title: string;
  value: number;
  subtitle: string;
  color: "red" | "yellow" | "blue" | "green";
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const styles = {
    red: {
      background: "bg-red-50",
      border: "border-red-100",
      text: "text-red-700",
    },
    yellow: {
      background: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-700",
    },
    blue: {
      background: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-700",
    },
    green: {
      background: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-700",
    },
  };

  const style = styles[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
      rounded-2xl
      border
      ${style.border}
      bg-white
      p-5
      text-left
      shadow-sm
      transition
      hover:-translate-y-1
      hover:shadow-md
      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-blue-200
    `}>
      <div className="
        flex
        items-center
        justify-between
        mb-6
      ">
        <div className={`
          w-12
          h-12
          rounded-2xl
          flex
          items-center
          justify-center
          ${style.background}
          ${style.text}
        `}>
          {icon}
        </div>
      </div>

      <h2 className="
        text-lg
        font-semibold
        mb-2
      ">
        {title}
      </h2>

      <p className={`
        text-4xl
        font-black
        mb-2
        ${style.text}
      `}>
        {value}
      </p>

      <p className="text-slate-500">
        {subtitle}
      </p>
    </button>
  );
}
